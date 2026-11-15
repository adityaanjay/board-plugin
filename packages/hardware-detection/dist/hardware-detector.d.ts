/**
 * Hardware Detector Module
 * Scans serial ports, detects boards via VID/PID, and emits events
 */
import { EventEmitter } from 'eventemitter3';
import type { Module, CoreEngineStatus, HealthCheckResult } from '@board/core-engine';
import type { BoardDatabase } from '@board/board-database';
import type { DetectedDevice, HardwareDetectionConfig, HardwareDetectionResult, HardwareDetectorEvents, HardwareDetectorOptions } from './types.js';
/**
 * Default hardware detection configuration
 */
export declare const DEFAULT_HARDWARE_DETECTION_CONFIG: HardwareDetectionConfig;
/**
 * Hardware Detector class
 * Uses EventEmitter3 internally for event handling and implements Module interface
 */
export declare class HardwareDetector implements Module {
    readonly name = "hardware-detector";
    readonly version = "0.1.0";
    readonly dependencies: string[];
    private readonly emitter;
    private config;
    private boardDatabase;
    private logger;
    private status;
    private scanTimer;
    private knownDevices;
    private previousPorts;
    constructor(options?: HardwareDetectorOptions);
    /**
     * Get the internal event emitter (for advanced usage)
     */
    getEmitter(): EventEmitter<HardwareDetectorEvents>;
    /**
     * Subscribe to an event
     */
    on(event: keyof HardwareDetectorEvents, listener: (...args: any[]) => void): this;
    /**
     * Unsubscribe from an event
     */
    off(event: keyof HardwareDetectorEvents, listener: (...args: any[]) => void): this;
    /**
     * Subscribe to an event once
     */
    once(event: keyof HardwareDetectorEvents, listener: (...args: any[]) => void): this;
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: keyof HardwareDetectorEvents): this;
    /**
     * Initialize the hardware detector
     * Module interface implementation
     */
    initialize(_core: any): Promise<void>;
    /**
     * Start the hardware detector (begin auto-scanning)
     * Module interface implementation
     */
    start(): Promise<void>;
    /**
     * Stop the hardware detector (stop auto-scanning)
     * Module interface implementation
     */
    stop(): Promise<void>;
    /**
     * Destroy the hardware detector (cleanup)
     * Module interface implementation
     */
    destroy(): Promise<void>;
    /**
     * Get current module status
     */
    getStatus(): CoreEngineStatus;
    /**
     * Health check
     * Module interface implementation
     */
    healthCheck(): Promise<HealthCheckResult>;
    /**
     * Get configuration
     */
    getConfig(): HardwareDetectionConfig;
    /**
     * Update configuration
     */
    setConfig(config: Partial<HardwareDetectionConfig>): void;
    /**
     * Start automatic scanning
     */
    private startAutoScan;
    /**
     * Stop automatic scanning
     */
    private stopAutoScan;
    /**
     * Scan for connected devices
     */
    scan(): Promise<HardwareDetectionResult>;
    /**
     * Process a single port and detect board
     */
    private processPort;
    /**
     * Get all currently known devices
     */
    getDevices(): DetectedDevice[];
    /**
     * Get a specific device by port
     */
    getDevice(port: string): DetectedDevice | undefined;
    /**
     * Manually trigger a scan
     */
    triggerScan(): Promise<HardwareDetectionResult>;
    /**
     * Add a VID/PID to watch list
     */
    addWatchedVidPid(vid: string, pid: string): void;
    /**
     * Remove a VID/PID from watch list
     */
    removeWatchedVidPid(vid: string, pid: string): boolean;
    /**
     * Set board database (for testing or dynamic updates)
     */
    setBoardDatabase(boardDatabase: BoardDatabase): void;
}
/**
 * Create a hardware detector instance
 */
export declare function createHardwareDetector(options?: HardwareDetectorOptions): HardwareDetector;
//# sourceMappingURL=hardware-detector.d.ts.map