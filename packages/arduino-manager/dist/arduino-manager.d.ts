/**
 * Arduino Manager Module
 * Provides Arduino CLI integration for compiling and uploading sketches
 */
import { EventEmitter } from 'eventemitter3';
import type { Module, CoreEngineStatus, HealthCheckResult } from '@board/core-engine';
import type { BoardDatabase, BoardDefinition, BoardVariant } from '@board/board-database';
import type { HardwareDetector } from '@board/hardware-detection';
import type { SerialManager } from '@board/serial-comm';
import type { SketchConfig, CompileResult, UploadResult, ArduinoBoardInfo, ArduinoCoreInfo, ArduinoManagerEvents, ArduinoManagerOptions } from './types.js';
/**
 * Arduino Manager class
 * Manages Arduino CLI operations for compiling and uploading
 */
export declare class ArduinoManager implements Module {
    readonly name = "arduino-manager";
    readonly version = "0.1.0";
    readonly dependencies: string[];
    private readonly emitter;
    private config;
    private logger;
    private status;
    private boardDatabase;
    private hardwareDetector;
    private _serialManager;
    private cliPath;
    private cliVersion;
    constructor(options?: ArduinoManagerOptions, boardDatabase?: BoardDatabase, hardwareDetector?: HardwareDetector, serialManager?: SerialManager);
    /**
     * Get the internal event emitter
     */
    getEmitter(): EventEmitter<ArduinoManagerEvents>;
    /**
     * Subscribe to an event
     */
    on(event: keyof ArduinoManagerEvents, listener: (...args: any[]) => void): this;
    /**
     * Unsubscribe from an event
     */
    off(event: keyof ArduinoManagerEvents, listener: (...args: any[]) => void): this;
    /**
     * Subscribe to an event once
     */
    once(event: keyof ArduinoManagerEvents, listener: (...args: any[]) => void): this;
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: keyof ArduinoManagerEvents): this;
    /**
     * Initialize the Arduino manager
     * Module interface implementation
     */
    initialize(_core: any): Promise<void>;
    /**
     * Start the Arduino manager
     * Module interface implementation
     */
    start(): Promise<void>;
    /**
     * Stop the Arduino manager
     * Module interface implementation
     */
    stop(): Promise<void>;
    /**
     * Destroy the Arduino manager (cleanup)
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
     * Find arduino-cli executable
     */
    private findCli;
    /**
     * Run arduino-cli command
     */
    private runCli;
    /**
     * Update board index
     */
    updateBoardIndex(): Promise<void>;
    /**
     * List all boards
     */
    listBoards(): Promise<ArduinoBoardInfo[]>;
    /**
     * List installed cores
     */
    listCores(): Promise<ArduinoCoreInfo[]>;
    /**
     * Install a core
     */
    installCore(core: string): Promise<void>;
    /**
     * Compile a sketch
     */
    compile(sketchConfig: SketchConfig): Promise<CompileResult>;
    /**
     * Upload a sketch
     */
    upload(sketchConfig: SketchConfig): Promise<UploadResult>;
    /**
     * Compile and upload a sketch in one step
     */
    compileAndUpload(sketchConfig: SketchConfig): Promise<{
        compile: CompileResult;
        upload: UploadResult;
    }>;
    /**
     * Detect upload port based on board FQBN
     */
    private detectUploadPort;
    /**
     * Find compiled binary path
     */
    private findBinary;
    /**
     * Get board info from board database
     */
    getBoardInfo(boardId: string, variantId?: string): {
        board: BoardDefinition | undefined;
        variant: BoardVariant | undefined;
    };
    /**
     * Get FQBN for a board
     */
    getFqbn(boardId: string, variantId?: string): string | undefined;
    /**
     * Set dependencies (for testing or dynamic updates)
     */
    setBoardDatabase(boardDatabase: BoardDatabase): void;
    setHardwareDetector(hardwareDetector: HardwareDetector): void;
    setSerialManager(serialManager: SerialManager): void;
}
/**
 * Create an Arduino manager instance
 */
export declare function createArduinoManager(options?: ArduinoManagerOptions, boardDatabase?: BoardDatabase, hardwareDetector?: HardwareDetector, serialManager?: SerialManager): ArduinoManager;
//# sourceMappingURL=arduino-manager.d.ts.map