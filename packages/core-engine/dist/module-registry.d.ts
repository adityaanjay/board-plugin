/**
 * Module Registry for Core Engine
 * Manages module registration, dependency resolution, and lifecycle
 */
import type { Module, ModuleConfig, HealthCheckResult } from './types.js';
import { EventBus } from './event-bus.js';
export interface RegisteredModule {
    module: Module;
    config: ModuleConfig;
    status: 'registered' | 'initializing' | 'initialized' | 'starting' | 'started' | 'stopping' | 'stopped' | 'destroyed' | 'error';
    error?: Error;
    dependencies: string[];
    dependents: string[];
}
export declare class ModuleRegistry {
    private modules;
    private eventBus;
    private initializationOrder;
    constructor(eventBus: EventBus);
    /**
     * Register a module with its configuration
     */
    register(module: Module, config: ModuleConfig): void;
    /**
     * Extract dependencies from module config
     */
    private extractDependencies;
    /**
     * Get a registered module by name
     */
    get(name: string): RegisteredModule | undefined;
    /**
     * Get all registered modules
     */
    getAll(): RegisteredModule[];
    /**
     * Get modules sorted by priority (highest first)
     */
    getSortedByPriority(): RegisteredModule[];
    /**
     * Calculate initialization order using topological sort
     */
    calculateInitializationOrder(): string[];
    /**
     * Get the calculated initialization order
     */
    getInitializationOrder(): string[];
    /**
     * Update module status
     */
    setStatus(name: string, status: RegisteredModule['status'], error?: Error): void;
    /**
     * Get module status
     */
    getStatus(name: string): RegisteredModule['status'] | undefined;
    /**
     * Check if all modules are in a specific status
     */
    allModulesStatus(status: RegisteredModule['status']): boolean;
    /**
     * Get modules with error status
     */
    getErrorModules(): RegisteredModule[];
    /**
     * Run health checks on all modules
     */
    runHealthChecks(): Promise<HealthCheckResult>;
    /**
     * Unregister a module
     */
    unregister(name: string): boolean;
    /**
     * Clear all modules
     */
    clear(): void;
    /**
     * Get count of registered modules
     */
    size(): number;
}
//# sourceMappingURL=module-registry.d.ts.map