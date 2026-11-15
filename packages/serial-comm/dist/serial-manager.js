"use strict";
/**
 * Serial Manager Module
 * Handles serial port connections, data streaming, and monitoring
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialManager = void 0;
exports.createSerialManager = createSerialManager;
const eventemitter3_1 = require("eventemitter3");
const serialport_1 = require("serialport");
const parser_readline_1 = require("@serialport/parser-readline");
const pino_1 = __importDefault(require("pino"));
const types_js_1 = require("./types.js");
/**
 * Serial Manager class
 * Manages serial port connections and data streaming
 */
class SerialManager {
    name = 'serial-manager';
    version = '0.1.0';
    dependencies = ['hardware-detection'];
    emitter;
    defaultConfig;
    logger;
    status = 'created';
    connections = new Map();
    parsers = new Map();
    connectionInfo = new Map();
    monitors = new Map();
    monitorBuffers = new Map();
    constructor(options = {}) {
        this.emitter = new eventemitter3_1.EventEmitter();
        this.defaultConfig = {
            ...types_js_1.DEFAULT_SERIAL_CONFIG,
            ...options.config,
        };
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
     * Initialize the serial manager
     * Module interface implementation
     */
    async initialize(_core) {
        if (this.status !== 'created') {
            throw new Error(`Cannot initialize module in state: ${this.status}`);
        }
        this.status = 'initializing';
        this.logger.info('Initializing serial manager');
        this.status = 'initialized';
        this.logger.info('Serial manager initialized');
    }
    /**
     * Start the serial manager
     * Module interface implementation
     */
    async start() {
        if (this.status !== 'initialized') {
            throw new Error(`Cannot start module in state: ${this.status}`);
        }
        this.status = 'starting';
        this.logger.info('Starting serial manager');
        this.status = 'started';
        this.logger.info('Serial manager started');
    }
    /**
     * Stop the serial manager (close all connections)
     * Module interface implementation
     */
    async stop() {
        if (this.status !== 'started') {
            throw new Error(`Cannot stop module in state: ${this.status}`);
        }
        this.status = 'stopping';
        this.logger.info('Stopping serial manager');
        // Close all connections
        await this.closeAllConnections();
        this.status = 'stopped';
        this.logger.info('Serial manager stopped');
    }
    /**
     * Destroy the serial manager (cleanup)
     * Module interface implementation
     */
    async destroy() {
        if (this.status === 'destroyed') {
            return;
        }
        this.logger.info('Destroying serial manager');
        await this.closeAllConnections();
        this.connections.clear();
        this.parsers.clear();
        this.connectionInfo.clear();
        this.monitors.clear();
        this.monitorBuffers.clear();
        this.removeAllListeners();
        this.status = 'destroyed';
        this.logger.info('Serial manager destroyed');
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
            // Test if serialport is working
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
                    {
                        name: 'connections',
                        status: 'pass',
                        message: `${this.connections.size} active connections`,
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
     * Get default configuration
     */
    getDefaultConfig() {
        return { ...this.defaultConfig };
    }
    /**
     * Set default configuration
     */
    setDefaultConfig(config) {
        this.defaultConfig = { ...this.defaultConfig, ...config };
        this.logger.debug({ config: this.defaultConfig }, 'Default serial config updated');
    }
    /**
     * Build final serial port config by merging defaults with overrides
     */
    buildFinalConfig(port, config) {
        return {
            path: port,
            baudRate: config?.baudRate ?? this.defaultConfig.baudRate,
            dataBits: config?.dataBits ?? this.defaultConfig.dataBits,
            stopBits: config?.stopBits ?? this.defaultConfig.stopBits,
            parity: config?.parity ?? this.defaultConfig.parity,
            rtscts: config?.rtscts ?? this.defaultConfig.rtscts,
            xon: config?.xon ?? this.defaultConfig.xon,
            xoff: config?.xoff ?? this.defaultConfig.xoff,
            xany: config?.xany ?? this.defaultConfig.xany,
            hupcl: config?.hupcl ?? this.defaultConfig.hupcl,
            lock: config?.lock ?? this.defaultConfig.lock,
            autoOpen: config?.autoOpen ?? this.defaultConfig.autoOpen,
            highWaterMark: config?.highWaterMark ?? this.defaultConfig.highWaterMark,
            encoding: config?.encoding ?? this.defaultConfig.encoding,
        };
    }
    /**
     * Open a serial port connection
     */
    async openPort(port, config) {
        const finalConfig = this.buildFinalConfig(port, config);
        // Check if already open
        if (this.connections.has(port)) {
            const existing = this.connections.get(port);
            if (existing && existing.isOpen) {
                this.logger.warn({ port }, 'Port already open');
                return this.getConnectionInfo(port);
            }
            // Close existing if not open
            await this.closePort(port);
        }
        // Update connection info to connecting state
        const info = {
            port,
            config: finalConfig,
            state: 'connecting',
            bytesReceived: 0,
            bytesSent: 0,
        };
        this.connectionInfo.set(port, info);
        try {
            // Filter out undefined values to avoid issues with exactOptionalPropertyTypes
            const { path: _, ...configWithoutPath } = finalConfig;
            const filteredConfig = Object.fromEntries(Object.entries(configWithoutPath).filter(([, value]) => value !== undefined));
            const serialPort = new serialport_1.SerialPort({ path: port, ...filteredConfig });
            // Wait for port to open
            await new Promise((resolve, reject) => {
                serialPort.once('open', () => resolve());
                serialPort.once('error', (err) => reject(err));
                // Timeout after 5 seconds
                setTimeout(() => reject(new Error('Connection timeout')), 5000);
            });
            // Set up data handling
            const parser = serialPort.pipe(new parser_readline_1.ReadlineParser({ delimiter: '\n' }));
            serialPort.on('data', (data) => {
                this.handleData(port, data);
            });
            serialPort.on('error', (error) => {
                this.handleError(port, error);
            });
            serialPort.on('close', () => {
                this.handleClose(port);
            });
            // Store connection
            this.connections.set(port, serialPort);
            this.parsers.set(port, parser);
            // Update connection info
            info.state = 'connected';
            info.connectedAt = Date.now();
            info.lastError = undefined;
            this.connectionInfo.set(port, info);
            this.emitter.emit('open', port);
            this.emitter.emit('stateChange', port, 'connected');
            this.logger.info({ port, config: finalConfig }, 'Serial port opened');
            return info;
        }
        catch (error) {
            info.state = 'error';
            info.lastError = error;
            this.connectionInfo.set(port, info);
            this.emitter.emit('stateChange', port, 'error');
            this.logger.error({ port, error }, 'Failed to open serial port');
            throw error;
        }
    }
    /**
     * Close a serial port connection
     */
    async closePort(port) {
        const serialPort = this.connections.get(port);
        if (!serialPort) {
            this.logger.warn({ port }, 'Port not found for closing');
            return;
        }
        const info = this.connectionInfo.get(port);
        if (info) {
            info.state = 'closing';
            this.connectionInfo.set(port, info);
            this.emitter.emit('stateChange', port, 'closing');
        }
        try {
            await new Promise((resolve, reject) => {
                serialPort.close((err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
        }
        catch (error) {
            this.logger.error({ port, error }, 'Error closing serial port');
            throw error;
        }
        finally {
            this.connections.delete(port);
            const parser = this.parsers.get(port);
            if (parser) {
                parser.end();
            }
            this.parsers.delete(port);
            if (info) {
                info.state = 'disconnected';
                this.connectionInfo.set(port, info);
            }
            this.emitter.emit('close', port);
            this.emitter.emit('stateChange', port, 'disconnected');
            this.logger.info({ port }, 'Serial port closed');
        }
    }
    /**
     * Close all serial port connections
     */
    async closeAllConnections() {
        const ports = Array.from(this.connections.keys());
        await Promise.all(ports.map((port) => this.closePort(port)));
    }
    /**
     * Write data to a serial port
     */
    async write(port, data) {
        const serialPort = this.connections.get(port);
        if (!serialPort) {
            throw new Error(`Port ${port} is not open`);
        }
        if (!serialPort.isOpen) {
            throw new Error(`Port ${port} is not open`);
        }
        return new Promise((resolve, reject) => {
            serialPort.write(data, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    const info = this.connectionInfo.get(port);
                    if (info) {
                        info.bytesSent += Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data);
                        this.connectionInfo.set(port, info);
                    }
                    resolve();
                }
            });
        });
    }
    /**
     * Write line to a serial port (with newline)
     */
    async writeLine(port, line) {
        await this.write(port, line + '\n');
    }
    /**
     * Handle incoming data
     */
    handleData(port, data) {
        const info = this.connectionInfo.get(port);
        if (info) {
            info.bytesReceived += data.length;
            this.connectionInfo.set(port, info);
        }
        const chunk = {
            port,
            data,
            timestamp: Date.now(),
        };
        // Add to monitor buffer if monitoring
        const monitorConfig = this.monitors.get(port);
        if (monitorConfig) {
            const buffer = this.monitorBuffers.get(port) || [];
            buffer.push(chunk);
            // Trim buffer if too large
            if (buffer.length > monitorConfig.maxBufferSize) {
                buffer.shift();
            }
            this.monitorBuffers.set(port, buffer);
        }
        this.emitter.emit('data', chunk);
    }
    /**
     * Handle port error
     */
    handleError(port, error) {
        const info = this.connectionInfo.get(port);
        if (info) {
            info.state = 'error';
            info.lastError = error;
            this.connectionInfo.set(port, info);
            this.emitter.emit('stateChange', port, 'error');
        }
        this.emitter.emit('error', error);
        this.logger.error({ port, error }, 'Serial port error');
    }
    /**
     * Handle port close
     */
    handleClose(port) {
        const info = this.connectionInfo.get(port);
        if (info) {
            info.state = 'disconnected';
            this.connectionInfo.set(port, info);
        }
        this.emitter.emit('close', port);
        this.emitter.emit('stateChange', port, 'disconnected');
        this.logger.info({ port }, 'Serial port closed unexpectedly');
    }
    /**
     * Get connection info for a port
     */
    getConnectionInfo(port) {
        return this.connectionInfo.get(port);
    }
    /**
     * Get all connection info
     */
    getAllConnections() {
        return Array.from(this.connectionInfo.values());
    }
    /**
     * Check if a port is connected
     */
    isConnected(port) {
        const serialPort = this.connections.get(port);
        return serialPort !== undefined && serialPort.isOpen;
    }
    /**
     * Start monitoring a port
     */
    startMonitoring(config) {
        if (this.monitors.has(config.port)) {
            this.logger.warn({ port: config.port }, 'Already monitoring this port');
            return;
        }
        this.monitors.set(config.port, config);
        this.monitorBuffers.set(config.port, []);
        this.logger.info({ port: config.port }, 'Started monitoring');
    }
    /**
     * Stop monitoring a port
     */
    stopMonitoring(port) {
        this.monitors.delete(port);
        this.monitorBuffers.delete(port);
        this.logger.info({ port }, 'Stopped monitoring');
    }
    /**
     * Get monitor buffer for a port
     */
    getMonitorBuffer(port) {
        return this.monitorBuffers.get(port) || [];
    }
    /**
     * Clear monitor buffer for a port
     */
    clearMonitorBuffer(port) {
        const buffer = this.monitorBuffers.get(port);
        if (buffer) {
            buffer.length = 0;
        }
    }
    /**
     * Get all monitored ports
     */
    getMonitoredPorts() {
        return Array.from(this.monitors.keys());
    }
}
exports.SerialManager = SerialManager;
/**
 * Create a serial manager instance
 */
function createSerialManager(options = {}) {
    return new SerialManager(options);
}
//# sourceMappingURL=serial-manager.js.map