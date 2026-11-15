/**
 * Core Engine - Main entry point for Board Plugin
 * Manages plugin lifecycle, modules, and event bus
 */
import { Logger } from 'pino';
import type { CoreConfig, Module, HealthCheckResult, CoreEvent, CoreEventListener } from './types.js';
import { EventBus } from './event-bus.js';
import { ModuleRegistry } from './module-registry.js';
export interface CoreEngineOptions {
    config: CoreConfig;
    logger?: Logger;
}
export declare class CoreEngine {
    private config;
    private logger;
    private eventBus;
    private moduleRegistry;
    private status;
    private startTime?;
    constructor(options: CoreEngineOptions);
    /**
     * Create default logger
     */
    private createDefaultLogger;
    /**
     * Get the event bus
     */
    getEventBus(): EventBus;
    /**
     * Get the module registry
     */
    getModuleRegistry(): ModuleRegistry;
    /**
     * Get the logger
     */
    getLogger(): Logger;
    /**
     * Get current status
     */
    getStatus(): CoreEngine['status'];
    /**
     * Get configuration
     */
    getConfig(): CoreConfig;
    /**
     * Initialize the core engine and all modules
     */
    initialize(): Promise<void>;
    /**
     * Start the core engine and all modules
     */
    start(): Promise<void>;
    /**
     * Stop the core engine and all modules
     */
    stop(): Promise<void>;
    /**
     * Destroy the core engine and all modules
     */
    destroy(): Promise<void>;
    /**
     * Register a module with the core engine
     */
    registerModule(module: Module, config: CoreConfig['modules'][0]): void;
    /**
     * Run health checks on all modules
     */
    healthCheck(): Promise<HealthCheckResult>;
    /**
     * Get uptime in milliseconds
     */
    getUptime(): number;
    /**
     * Subscribe to core events
     */
    on<E extends CoreEvent>(event: E, listener: CoreEventListener<E>): this;
    /**
     * Unsubscribe from core events
     */
    off<E extends CoreEvent>(event: E, listener: CoreEventListener<E>): this;
    /**
     * Create a child logger for a module
     */
    createChildLogger(moduleName: string): Logger;
}
/**
 * Create a core engine with default configuration
 */
export declare function createCoreEngine(config?: Partial<CoreConfig>): Promise<CoreEngine>;
//# sourceMappingURL=core-engine.d.ts.map