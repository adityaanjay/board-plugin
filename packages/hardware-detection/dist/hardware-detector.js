"use strict";
/**
 * Hardware Detector Module
 * Scans serial ports, detects boards via VID/PID, and emits events
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardwareDetector = exports.DEFAULT_HARDWARE_DETECTION_CONFIG = void 0;
exports.createHardwareDetector = createHardwareDetector;
const eventemitter3_1 = require("eventemitter3");
const serialport_1 = require("serialport");
const pino_1 = __importDefault(require("pino"));
/**
 * Default hardware detection configuration
 */
exports.DEFAULT_HARDWARE_DETECTION_CONFIG = {
    scanInterval: 5000,
    autoScan: true,
    watchedVidPids: [],
};
/**
 * Hardware Detector class
 * Uses EventEmitter3 internally for event handling and implements Module interface
 */
class HardwareDetector {
    name = 'hardware-detector';
    version = '0.1.0';
    dependencies = ['board-database'];
    emitter;
    config;
    boardDatabase;
    logger;
    status = 'created';
    scanTimer = null;
    knownDevices = new Map();
    previousPorts = new Set();
    constructor(options = {}) {
        this.emitter = new eventemitter3_1.EventEmitter();
        this.config = {
            ...exports.DEFAULT_HARDWARE_DETECTION_CONFIG,
            ...options.config,
        };
        this.boardDatabase = options.boardDatabase;
        this.logger = options.logger || (0, pino_1.default)({ level: 'info' });
    }
    /**
     * Get the internal event emitter (for advanced usage)
     */
    getEmitter() {
        return this.emitter;
    }
    /**
     * Subscribe to an event
     */
    on(event, listener) {
        this.emitter.on(event, listener);
        return this;
    }
    /**
     * Unsubscribe from an event
     */
    off(event, listener) {
        this.emitter.off(event, listener);
        return this;
    }
    /**
     * Subscribe to an event once
     */
    once(event, listener) {
        this.emitter.once(event, listener);
        return this;
    }
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event) {
        this.emitter.removeAllListeners(event);
        return this;
    }
    /**
     * Initialize the hardware detector
     * Module interface implementation
     */
    async initialize(_core) {
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
    async start() {
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
    async stop() {
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
    async destroy() {
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
    getStatus() {
        return this.status;
    }
    /**
     * Health check
     * Module interface implementation
     */
    async healthCheck() {
        try {
            // Test if serialport is working by listing ports
            await serialport_1.SerialPort.list();
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
        }
        catch (error) {
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
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    setConfig(config) {
        const wasAutoScan = this.config.autoScan;
        this.config = { ...this.config, ...config };
        // Handle autoScan changes
        if (wasAutoScan !== this.config.autoScan) {
            if (this.config.autoScan && this.status === 'started') {
                this.startAutoScan();
            }
            else if (!this.config.autoScan) {
                this.stopAutoScan();
            }
        }
        this.logger.debug({ config: this.config }, 'Hardware detection config updated');
    }
    /**
     * Start automatic scanning
     */
    startAutoScan() {
        if (this.scanTimer) {
            return; // Already running
        }
        this.scanTimer = setInterval(async () => {
            try {
                await this.scan();
            }
            catch (error) {
                this.logger.error({ error }, 'Auto-scan failed');
                this.emitter.emit('scan:error', error);
            }
        }, this.config.scanInterval);
        this.logger.debug({ interval: this.config.scanInterval }, 'Auto-scan started');
    }
    /**
     * Stop automatic scanning
     */
    stopAutoScan() {
        if (this.scanTimer) {
            clearInterval(this.scanTimer);
            this.scanTimer = null;
            this.logger.debug('Auto-scan stopped');
        }
    }
    /**
     * Scan for connected devices
     */
    async scan() {
        this.emitter.emit('scan:start');
        const ports = await serialport_1.SerialPort.list();
        const currentPorts = new Set(ports.map((p) => p.path));
        const devices = [];
        const newDevices = [];
        const removedDevices = [];
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
        const result = {
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
    async processPort(portInfo) {
        const device = {
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
    getDevices() {
        return Array.from(this.knownDevices.values());
    }
    /**
     * Get a specific device by port
     */
    getDevice(port) {
        return this.knownDevices.get(port);
    }
    /**
     * Manually trigger a scan
     */
    async triggerScan() {
        return this.scan();
    }
    /**
     * Add a VID/PID to watch list
     */
    addWatchedVidPid(vid, pid) {
        const vidPid = { vid: vid.toLowerCase(), pid: pid.toLowerCase() };
        const exists = this.config.watchedVidPids.some((wp) => wp.vid === vidPid.vid && wp.pid === vidPid.pid);
        if (!exists) {
            this.config.watchedVidPids.push(vidPid);
            this.logger.debug({ vidPid }, 'Added watched VID/PID');
        }
    }
    /**
     * Remove a VID/PID from watch list
     */
    removeWatchedVidPid(vid, pid) {
        const index = this.config.watchedVidPids.findIndex((wp) => wp.vid === vid.toLowerCase() && wp.pid === pid.toLowerCase());
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
    setBoardDatabase(boardDatabase) {
        this.boardDatabase = boardDatabase;
    }
}
exports.HardwareDetector = HardwareDetector;
/**
 * Create a hardware detector instance
 */
function createHardwareDetector(options = {}) {
    return new HardwareDetector(options);
}
//# sourceMappingURL=hardware-detector.js.map