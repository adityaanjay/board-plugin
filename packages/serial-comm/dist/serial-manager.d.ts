/**
 * Serial Manager Module
 * Handles serial port connections, data streaming, and monitoring
 */
import { EventEmitter } from 'eventemitter3';
import type { Module, CoreEngineStatus, HealthCheckResult } from '@board/core-engine';
import type { SerialPortConfig, SerialConnectionInfo, SerialDataChunk, SerialMonitorConfig, SerialMonitorEvents, SerialManagerOptions } from './types.js';
/**
 * Serial Manager class
 * Manages serial port connections and data streaming
 */
export declare class SerialManager implements Module {
    readonly name = "serial-manager";
    readonly version = "0.1.0";
    readonly dependencies: string[];
    private readonly emitter;
    private defaultConfig;
    private logger;
    private status;
    private connections;
    private parsers;
    private connectionInfo;
    private monitors;
    private monitorBuffers;
    constructor(options?: SerialManagerOptions);
    /**
     * Get the internal event emitter (for advanced usage)
     */
    getEmitter(): EventEmitter<SerialMonitorEvents>;
    /**
     * Subscribe to an event
     */
    on(event: keyof SerialMonitorEvents, listener: (...args: any[]) => void): this;
    /**
     * Unsubscribe from an event
     */
    off(event: keyof SerialMonitorEvents, listener: (...args: any[]) => void): this;
    /**
     * Subscribe to an event once
     */
    once(event: keyof SerialMonitorEvents, listener: (...args: any[]) => void): this;
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: keyof SerialMonitorEvents): this;
    /**
     * Initialize the serial manager
     * Module interface implementation
     */
    initialize(_core: any): Promise<void>;
    /**
     * Start the serial manager
     * Module interface implementation
     */
    start(): Promise<void>;
    /**
     * Stop the serial manager (close all connections)
     * Module interface implementation
     */
    stop(): Promise<void>;
    /**
     * Destroy the serial manager (cleanup)
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
     * Get default configuration
     */
    getDefaultConfig(): SerialPortConfig;
    /**
     * Set default configuration
     */
    setDefaultConfig(config: Partial<SerialPortConfig>): void;
    /**
     * Build final serial port config by merging defaults with overrides
     */
    private buildFinalConfig;
    /**
     * Open a serial port connection
     */
    openPort(port: string, config?: Partial<SerialPortConfig>): Promise<SerialConnectionInfo>;
    /**
     * Close a serial port connection
     */
    closePort(port: string): Promise<void>;
    /**
     * Close all serial port connections
     */
    closeAllConnections(): Promise<void>;
    /**
     * Write data to a serial port
     */
    write(port: string, data: string | Buffer): Promise<void>;
    /**
     * Write line to a serial port (with newline)
     */
    writeLine(port: string, line: string): Promise<void>;
    /**
     * Handle incoming data
     */
    private handleData;
    /**
     * Handle port error
     */
    private handleError;
    /**
     * Handle port close
     */
    private handleClose;
    /**
     * Get connection info for a port
     */
    getConnectionInfo(port: string): SerialConnectionInfo | undefined;
    /**
     * Get all connection info
     */
    getAllConnections(): SerialConnectionInfo[];
    /**
     * Check if a port is connected
     */
    isConnected(port: string): boolean;
    /**
     * Start monitoring a port
     */
    startMonitoring(config: SerialMonitorConfig): void;
    /**
     * Stop monitoring a port
     */
    stopMonitoring(port: string): void;
    /**
     * Get monitor buffer for a port
     */
    getMonitorBuffer(port: string): SerialDataChunk[];
    /**
     * Clear monitor buffer for a port
     */
    clearMonitorBuffer(port: string): void;
    /**
     * Get all monitored ports
     */
    getMonitoredPorts(): string[];
}
/**
 * Create a serial manager instance
 */
export declare function createSerialManager(options?: SerialManagerOptions): SerialManager;
//# sourceMappingURL=serial-manager.d.ts.map