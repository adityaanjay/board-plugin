/**
 * Hardware Detector Module
 * Scans serial ports, detects boards via VID/PID, and emits events
 */

import { EventEmitter } from 'eventemitter3';
import { SerialPort } from 'serialport';
import pino, { Logger } from 'pino';
import type { Module, CoreEngineStatus, HealthCheckResult } from '@board/core-engine';
import type { BoardDatabase } from '@board/board-database';
import type {
  SerialPortInfo,
  DetectedDevice,
  HardwareDetectionConfig,
  HardwareDetectionResult,
  HardwareDetectorEvents,
  HardwareDetectorOptions,
  VidPid,
} from './types.js';

/**
 * Default hardware detection configuration
 */
export const DEFAULT_HARDWARE_DETECTION_CONFIG: HardwareDetectionConfig = {
  scanInterval: 5000,
  autoScan: true,
  watchedVidPids: [],
};

/**
 * Hardware Detector class
 * Uses EventEmitter3 internally for event handling and implements Module interface
 */
export class HardwareDetector implements Module {
  public readonly name = 'hardware-detector';
  public readonly version = '0.1.0';
  public readonly dependencies: string[] = ['board-database'];

  private readonly emitter: EventEmitter<HardwareDetectorEvents>;
  private config: HardwareDetectionConfig;
  private boardDatabase: BoardDatabase;
  private logger: Logger;
  private status: CoreEngineStatus = 'created';
  private scanTimer: ReturnType<typeof setInterval> | null = null;
  private knownDevices: Map<string, DetectedDevice> = new Map();
  private previousPorts: Set<string> = new Set();

  constructor(options: HardwareDetectorOptions = {}) {
    this.emitter = new EventEmitter<HardwareDetectorEvents>();

    this.config = {
      ...DEFAULT_HARDWARE_DETECTION_CONFIG,
      ...options.config,
    };

    this.boardDatabase = options.boardDatabase;
    this.logger = options.logger || pino({ level: 'info' });
  }

  /**
   * Get the internal event emitter (for advanced usage)
   */
  getEmitter(): EventEmitter<HardwareDetectorEvents> {
    return this.emitter;
  }

  /**
   * Subscribe to an event
   */
  on(event: keyof HardwareDetectorEvents, listener: (...args: any[]) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  /**
   * Unsubscribe from an event
   */
  off(event: keyof HardwareDetectorEvents, listener: (...args: any[]) => void): this {
    this.emitter.off(event, listener);
    return this;
  }

  /**
   * Subscribe to an event once
   */
  once(event: keyof HardwareDetectorEvents, listener: (...args: any[]) => void): this {
    this.emitter.once(event, listener);
    return this;
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: keyof HardwareDetectorEvents): this {
    this.emitter.removeAllListeners(event);
    return this;
  }

  /**
   * Initialize the hardware detector
   * Module interface implementation
   */
  async initialize(_core: any): Promise<void> {
    if (this.status !== 'created') {
      throw new Error(`Cannot initialize module in state: ${this.status}`);
    }

    this.status = 'initializing';
    this.logger.info('Initializing hardware detector');

    if (!this.boardDatabase) {
      throw new Error('BoardDatabase is required for hardware detection');
    }

    // Perform initial scan
    await this.scan();

    this.status = 'initialized';
    this.logger.info('Hardware detector initialized');
  }

  /**
   * Start the hardware detector (begin auto-scanning)
   * Module interface implementation
   */
  async start(): Promise<void> {
    if (this.status !== 'initialized') {
      throw new Error(`Cannot start module in state: ${this.status}`);
    }

    this.status = 'starting';
    this.logger.info('Starting hardware detector');

    if (this.config.autoScan) {
      this.startAutoScan();
    }

    this.status = 'started';
    this.logger.info('Hardware detector started');
  }

  /**
   * Stop the hardware detector (stop auto-scanning)
   * Module interface implementation
   */
  async stop(): Promise<void> {
    if (this.status !== 'started') {
      throw new Error(`Cannot stop module in state: ${this.status}`);
    }

    this.status = 'stopping';
    this.logger.info('Stopping hardware detector');

    this.stopAutoScan();

    this.status = 'stopped';
    this.logger.info('Hardware detector stopped');
  }

  /**
   * Destroy the hardware detector (cleanup)
   * Module interface implementation
   */
  async destroy(): Promise<void> {
    if (this.status === 'destroyed') {
      return;
    }

    this.logger.info('Destroying hardware detector');
    this.stopAutoScan();
    this.knownDevices.clear();
    this.previousPorts.clear();
    this.removeAllListeners();
    this.status = 'destroyed';
    this.logger.info('Hardware detector destroyed');
  }

  /**
   * Get current module status
   */
  getStatus(): CoreEngineStatus {
    return this.status;
  }

  /**
   * Health check
   * Module interface implementation
   */
  async healthCheck(): Promise<HealthCheckResult> {
    try {
      // Test if serialport is working by listing ports
      await SerialPort.list();
      return {
        status: 'healthy',
        checks: [
          {
            name: 'serialport',
            status: 'pass',
            message: 'Serial port listing works',
            latency: 0,
          },
        ],
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        checks: [
          {
            name: 'serialport',
            status: 'fail',
            message: `Serial port listing failed: ${error}`,
            latency: 0,
          },
        ],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get configuration
   */
  getConfig(): HardwareDetectionConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<HardwareDetectionConfig>): void {
    const wasAutoScan = this.config.autoScan;
    this.config = { ...this.config, ...config };

    // Handle autoScan changes
    if (wasAutoScan !== this.config.autoScan) {
      if (this.config.autoScan && this.status === 'started') {
        this.startAutoScan();
      } else if (!this.config.autoScan) {
        this.stopAutoScan();
      }
    }

    this.logger.debug({ config: this.config }, 'Hardware detection config updated');
  }

  /**
   * Start automatic scanning
   */
  private startAutoScan(): void {
    if (this.scanTimer) {
      return; // Already running
    }

    this.scanTimer = setInterval(async () => {
      try {
        await this.scan();
      } catch (error) {
        this.logger.error({ error }, 'Auto-scan failed');
        this.emitter.emit('scan:error', error as Error);
      }
    }, this.config.scanInterval);

    this.logger.debug({ interval: this.config.scanInterval }, 'Auto-scan started');
  }

  /**
   * Stop automatic scanning
   */
  private stopAutoScan(): void {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
      this.logger.debug('Auto-scan stopped');
    }
  }

  /**
   * Scan for connected devices
   */
  async scan(): Promise<HardwareDetectionResult> {
    this.emitter.emit('scan:start');

    const ports = await SerialPort.list();
    const currentPorts = new Set(ports.map((p) => p.path));
    const devices: DetectedDevice[] = [];
    const newDevices: DetectedDevice[] = [];
    const removedDevices: DetectedDevice[] = [];

    // Process each port
    for (const portInfo of ports) {
      const device = await this.processPort(portInfo);
      devices.push(device);

      // Check if this is a new device
      if (!this.previousPorts.has(portInfo.path)) {
        newDevices.push(device);
        this.knownDevices.set(portInfo.path, device);
        this.emitter.emit('device:connected', device);

        // If board was detected, emit board:detected event
        if (device.boardDetection) {
          this.emitter.emit('board:detected', device.boardDetection);
        }
      }
    }

    // Check for removed devices
    for (const previousPort of this.previousPorts) {
      if (!currentPorts.has(previousPort)) {
        const removedDevice = this.knownDevices.get(previousPort);
        if (removedDevice) {
          removedDevices.push(removedDevice);
          this.knownDevices.delete(previousPort);
          this.emitter.emit('device:disconnected', removedDevice);
        }
      }
    }

    this.previousPorts = currentPorts;

    const result: HardwareDetectionResult = {
      devices,
      newDevices,
      removedDevices,
      timestamp: Date.now(),
    };

    this.emitter.emit('scan:complete', result);
    this.logger.debug({ deviceCount: devices.length, newCount: newDevices.length, removedCount: removedDevices.length }, 'Scan complete');

    return result;
  }

  /**
   * Process a single port and detect board
   */
  private async processPort(portInfo: SerialPortInfo): Promise<DetectedDevice> {
    const device: DetectedDevice = {
      port: portInfo.path,
      vid: portInfo.vendorId,
      pid: portInfo.productId,
      manufacturer: portInfo.manufacturer,
      serialNumber: portInfo.serialNumber,
      friendlyName: portInfo.friendlyName,
      timestamp: Date.now(),
    };

    // Try to detect board using VID/PID
    if (device.vid && device.pid) {
      const detection = this.boardDatabase.detectBoard(device.port, device.vid, device.pid);
      if (detection) {
        device.boardDetection = detection;
      }
    }

    // If no VID/PID detection, try heuristic
    if (!device.boardDetection) {
      const heuristicDetection = this.boardDatabase.detectBoard(device.port);
      if (heuristicDetection) {
        device.boardDetection = heuristicDetection;
      }
    }

    return device;
  }

  /**
   * Get all currently known devices
   */
  getDevices(): DetectedDevice[] {
    return Array.from(this.knownDevices.values());
  }

  /**
   * Get a specific device by port
   */
  getDevice(port: string): DetectedDevice | undefined {
    return this.knownDevices.get(port);
  }

  /**
   * Manually trigger a scan
   */
  async triggerScan(): Promise<HardwareDetectionResult> {
    return this.scan();
  }

  /**
   * Add a VID/PID to watch list
   */
  addWatchedVidPid(vid: string, pid: string): void {
    const vidPid: VidPid = { vid: vid.toLowerCase(), pid: pid.toLowerCase() };
    const exists = this.config.watchedVidPids.some(
      (wp) => wp.vid === vidPid.vid && wp.pid === vidPid.pid
    );
    if (!exists) {
      this.config.watchedVidPids.push(vidPid);
      this.logger.debug({ vidPid }, 'Added watched VID/PID');
    }
  }

  /**
   * Remove a VID/PID from watch list
   */
  removeWatchedVidPid(vid: string, pid: string): boolean {
    const index = this.config.watchedVidPids.findIndex(
      (wp) => wp.vid === vid.toLowerCase() && wp.pid === pid.toLowerCase()
    );
    if (index !== -1) {
      this.config.watchedVidPids.splice(index, 1);
      this.logger.debug({ vid, pid }, 'Removed watched VID/PID');
      return true;
    }
    return false;
  }

  /**
   * Set board database (for testing or dynamic updates)
   */
  setBoardDatabase(boardDatabase: BoardDatabase): void {
    this.boardDatabase = boardDatabase;
  }
}

/**
 * Create a hardware detector instance
 */
export function createHardwareDetector(options: HardwareDetectorOptions = {}): HardwareDetector {
  return new HardwareDetector(options);
}