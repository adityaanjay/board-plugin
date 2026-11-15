/**
 * PlatformIO Manager Module
 * Provides PlatformIO integration for building, uploading, and debugging
 */
import { EventEmitter } from 'eventemitter3';
import type { Module, CoreEngineStatus, HealthCheckResult } from '@board/core-engine';
import type { BoardDatabase, BoardDefinition, BoardVariant } from '@board/board-database';
import type { HardwareDetector } from '@board/hardware-detection';
import type { SerialManager } from '@board/serial-comm';
import type { BuildOptions, UploadOptions, BuildResult, UploadResult, PlatformIOPlatform, PlatformIOBoard, PlatformIOManagerEvents, PlatformIOManagerOptions } from './types.js';
/**
 * PlatformIO Manager class
 * Manages PlatformIO operations for building, uploading, and debugging
 */
export declare class PlatformIOManager implements Module {
    readonly name = "platformio-manager";
    readonly version = "0.1.0";
    readonly dependencies: string[];
    private readonly emitter;
    private config;
    private logger;
    private status;
    private boardDatabase;
    private hardwareDetector;
    private serialManager;
    private pioPath;
    private pioVersion;
    constructor(options?: PlatformIOManagerOptions, boardDatabase?: BoardDatabase, hardwareDetector?: HardwareDetector, serialManager?: SerialManager);
    /**
     * Get the internal event emitter
     */
    getEmitter(): EventEmitter<PlatformIOManagerEvents>;
    /**
     * Subscribe to an event
     */
    on(event: keyof PlatformIOManagerEvents, listener: (...args: any[]) => void): this;
    /**
     * Unsubscribe from an event
     */
    off(event: keyof PlatformIOManagerEvents, listener: (...args: any[]) => void): this;
    /**
     * Subscribe to an event once
     */
    once(event: keyof PlatformIOManagerEvents, listener: (...args: any[]) => void): this;
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: keyof PlatformIOManagerEvents): this;
    /**
     * Initialize the PlatformIO manager
     * Module interface implementation
     */
    initialize(_core: any): Promise<void>;
    /**
     * Start the PlatformIO manager
     * Module interface implementation
     */
    start(): Promise<void>;
    /**
     * Stop the PlatformIO manager
     * Module interface implementation
     */
    stop(): Promise<void>;
    /**
     * Destroy the PlatformIO manager (cleanup)
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
     * Find platformio executable
     */
    private findPio;
    /**
     * Run platformio command
     */
    private runPio;
    /**
     * List installed platforms
     */
    listPlatforms(): Promise<PlatformIOPlatform[]>;
    /**
     * Install a platform
     */
    installPlatform(platform: string): Promise<void>;
    /**
     * List boards for a platform
     */
    listBoards(platform?: string): Promise<PlatformIOBoard[]>;
    /**
     * Build a project
     */
    build(projectPath: string, options?: BuildOptions): Promise<BuildResult>;
    /**
     * Upload firmware to board
     */
    upload(projectPath: string, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Build and upload in one step
     */
    buildAndUpload(projectPath: string, options?: BuildOptions & UploadOptions): Promise<{
        build: BuildResult;
        upload: UploadResult;
    }>;
    /**
     * Monitor serial output
     */
    monitor(projectPath: string, environment?: string, port?: string, baudRate?: number): Promise<void>;
    /**
     * Debug a project (start debug server)
     */
    debug(projectPath: string, environment?: string): Promise<void>;
    /**
     * Find firmware file
     */
    private findFirmware;
    /**
     * Get board info from board database
     */
    getBoardInfo(boardId: string, variantId?: string): {
        board: BoardDefinition | undefined;
        variant: BoardVariant | undefined;
    };
    /**
     * Get PlatformIO board ID for a board
     */
    getPlatformIOBoard(boardId: string): string | undefined;
    /**
     * Create a new PlatformIO project
     */
    initProject(projectPath: string, boardId: string, framework?: string): Promise<void>;
    /**
     * Set dependencies (for testing or dynamic updates)
     */
    setBoardDatabase(boardDatabase: BoardDatabase): void;
    setHardwareDetector(hardwareDetector: HardwareDetector): void;
    setSerialManager(serialManager: SerialManager): void;
}
/**
 * Create a PlatformIO manager instance
 */
export declare function createPlatformIOManager(options?: PlatformIOManagerOptions, boardDatabase?: BoardDatabase, hardwareDetector?: HardwareDetector, serialManager?: SerialManager): PlatformIOManager;
//# sourceMappingURL=platformio-manager.d.ts.map