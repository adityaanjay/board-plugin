/**
 * ESP Manager Module
 * Provides esptool integration for flashing and monitoring ESP boards
 */
import { EventEmitter } from 'eventemitter3';
import type { Module, CoreEngineStatus, HealthCheckResult } from '@board/core-engine';
import type { BoardDatabase, BoardDefinition, BoardVariant } from '@board/board-database';
import type { HardwareDetector } from '@board/hardware-detection';
import type { SerialManager } from '@board/serial-comm';
import type { FlashOptions, FlashResult, EspChipInfo, EspPartition, EspManagerEvents, EspManagerOptions } from './types.js';
/**
 * ESP Manager class
 * Manages esptool operations for flashing and monitoring ESP boards
 */
export declare class EspManager implements Module {
    readonly name = "esp-manager";
    readonly version = "0.1.0";
    readonly dependencies: string[];
    private readonly emitter;
    private config;
    private logger;
    private status;
    private boardDatabase;
    private _hardwareDetector;
    private serialManager;
    private esptoolPath;
    private esptoolVersion;
    constructor(options?: EspManagerOptions, boardDatabase?: BoardDatabase, hardwareDetector?: HardwareDetector, serialManager?: SerialManager);
    /**
     * Get the internal event emitter
     */
    getEmitter(): EventEmitter<EspManagerEvents>;
    /**
     * Subscribe to an event
     */
    on(event: keyof EspManagerEvents, listener: (...args: any[]) => void): this;
    /**
     * Unsubscribe from an event
     */
    off(event: keyof EspManagerEvents, listener: (...args: any[]) => void): this;
    /**
     * Subscribe to an event once
     */
    once(event: keyof EspManagerEvents, listener: (...args: any[]) => void): this;
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: keyof EspManagerEvents): this;
    /**
     * Initialize the ESP manager
     * Module interface implementation
     */
    initialize(_core: any): Promise<void>;
    /**
     * Start the ESP manager
     * Module interface implementation
     */
    start(): Promise<void>;
    /**
     * Stop the ESP manager
     * Module interface implementation
     */
    stop(): Promise<void>;
    /**
     * Destroy the ESP manager (cleanup)
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
     * Find esptool executable
     */
    private findEsptool;
    /**
     * Run esptool command
     */
    private runEsptool;
    /**
     * Detect chip info
     */
    detectChip(port: string, baudRate?: number): Promise<EspChipInfo>;
    /**
     * Flash a binary to ESP board
     */
    flash(options: FlashOptions): Promise<FlashResult>;
    /**
     * Verify flash
     */
    private verifyFlash;
    /**
     * Erase flash
     */
    eraseFlash(port: string, baudRate?: number): Promise<FlashResult>;
    /**
     * Read flash
     */
    readFlash(port: string, address: string, size: number, outputPath: string, baudRate?: number): Promise<FlashResult>;
    /**
     * Get partition table
     */
    getPartitionTable(port: string, baudRate?: number): Promise<EspPartition[]>;
    /**
     * Get board info from board database
     */
    getBoardInfo(boardId: string, variantId?: string): {
        board: BoardDefinition | undefined;
        variant: BoardVariant | undefined;
    };
    /**
     * Get esptool chip name for a board
     */
    getEsptoolChip(boardId: string): string | undefined;
    /**
     * Set dependencies (for testing or dynamic updates)
     */
    setBoardDatabase(boardDatabase: BoardDatabase): void;
    setHardwareDetector(hardwareDetector: HardwareDetector): void;
    setSerialManager(serialManager: SerialManager): void;
}
/**
 * Create an ESP manager instance
 */
export declare function createEspManager(options?: EspManagerOptions, boardDatabase?: BoardDatabase, hardwareDetector?: HardwareDetector, serialManager?: SerialManager): EspManager;
//# sourceMappingURL=esp-manager.d.ts.map