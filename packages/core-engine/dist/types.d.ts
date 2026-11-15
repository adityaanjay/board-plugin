/**
 * Core type definitions for Board Plugin Core Engine
 */
export interface CoreEngine {
    getEventBus(): EventBus;
    getModuleRegistry(): ModuleRegistry;
    getLogger(): Logger;
    getStatus(): CoreEngineStatus;
    getConfig(): CoreConfig;
    registerModule(module: Module, config: ModuleConfig): void;
    healthCheck(): Promise<HealthCheckResult>;
    getUptime(): number;
    on<E extends CoreEvent>(event: E, listener: CoreEventListener<E>): this;
    off<E extends CoreEvent>(event: E, listener: CoreEventListener<E>): this;
    createChildLogger(moduleName: string): Logger;
}
export type CoreEngineStatus = 'created' | 'initializing' | 'initialized' | 'starting' | 'started' | 'stopping' | 'stopped' | 'destroyed';
export interface Module {
    name: string;
    version: string;
    initialize(core: CoreEngine): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    destroy(): Promise<void>;
    healthCheck(): Promise<HealthCheckResult>;
}
export interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: ModuleHealthCheck[];
    timestamp: Date;
}
export interface ModuleHealthCheck {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
    latency?: number;
    metadata?: Record<string, unknown>;
}
export interface CoreConfig {
    modules: ModuleConfig[];
    logging: LoggingConfig;
    eventBus: EventBusConfig;
}
export interface ModuleConfig {
    name: string;
    enabled: boolean;
    priority: number;
    config?: Record<string, unknown>;
}
export interface LoggingConfig {
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    prettyPrint: boolean;
    destination: 'stdout' | 'stderr' | 'file';
    filePath?: string;
}
export interface EventBusConfig {
    maxListeners: number;
    captureRejections: boolean;
}
/**
 * Event types
 */
export type CoreEvent = 'module:registered' | 'module:unregistered' | 'module:started' | 'module:stopped' | 'module:error' | 'core:started' | 'core:stopped' | 'core:error' | 'health:check';
/**
 * Event listener type for each event
 */
export type CoreEventListener<E extends CoreEvent> = E extends 'module:registered' ? (module: Module) => void : E extends 'module:unregistered' ? (moduleName: string) => void : E extends 'module:started' ? (moduleName: string) => void : E extends 'module:stopped' ? (moduleName: string) => void : E extends 'module:error' ? (moduleName: string, error: Error) => void : E extends 'core:started' ? () => void : E extends 'core:stopped' ? () => void : E extends 'core:error' ? (error: Error) => void : E extends 'health:check' ? (result: HealthCheckResult) => void : never;
import type { Logger as PinoLogger } from 'pino';
import type { EventBus as EventBusType } from './event-bus.js';
import type { ModuleRegistry as ModuleRegistryType } from './module-registry.js';
export type Logger = PinoLogger;
export type EventBus = EventBusType;
export type ModuleRegistry = ModuleRegistryType;
//# sourceMappingURL=types.d.ts.map