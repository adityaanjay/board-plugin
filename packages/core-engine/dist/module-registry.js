"use strict";
/**
 * Module Registry for Core Engine
 * Manages module registration, dependency resolution, and lifecycle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleRegistry = void 0;
class ModuleRegistry {
    modules = new Map();
    eventBus;
    initializationOrder = [];
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    /**
     * Register a module with its configuration
     */
    register(module, config) {
        if (this.modules.has(module.name)) {
            throw new Error(`Module ${module.name} is already registered`);
        }
        const registeredModule = {
            module,
            config,
            status: 'registered',
            dependencies: this.extractDependencies(config),
            dependents: [],
        };
        this.modules.set(module.name, registeredModule);
        this.eventBus.emit('module:registered', module);
    }
    /**
     * Extract dependencies from module config
     */
    extractDependencies(config) {
        // Dependencies can be specified in config.dependencies or inferred from priority
        return config.config?.dependencies || [];
    }
    /**
     * Get a registered module by name
     */
    get(name) {
        return this.modules.get(name);
    }
    /**
     * Get all registered modules
     */
    getAll() {
        return Array.from(this.modules.values());
    }
    /**
     * Get modules sorted by priority (highest first)
     */
    getSortedByPriority() {
        return this.getAll().sort((a, b) => b.config.priority - a.config.priority);
    }
    /**
     * Calculate initialization order using topological sort
     */
    calculateInitializationOrder() {
        const visited = new Set();
        const visiting = new Set();
        const order = [];
        const visit = (name) => {
            if (visited.has(name))
                return;
            if (visiting.has(name)) {
                throw new Error(`Circular dependency detected involving module: ${name}`);
            }
            visiting.add(name);
            const module = this.modules.get(name);
            if (module) {
                for (const dep of module.dependencies) {
                    if (this.modules.has(dep)) {
                        visit(dep);
                    }
                }
            }
            visiting.delete(name);
            visited.add(name);
            order.push(name);
        };
        for (const name of this.modules.keys()) {
            visit(name);
        }
        this.initializationOrder = order;
        return order;
    }
    /**
     * Get the calculated initialization order
     */
    getInitializationOrder() {
        if (this.initializationOrder.length === 0) {
            return this.calculateInitializationOrder();
        }
        return this.initializationOrder;
    }
    /**
     * Update module status
     */
    setStatus(name, status, error) {
        const registeredModule = this.modules.get(name);
        if (!registeredModule) {
            throw new Error(`Module ${name} not found`);
        }
        const oldStatus = registeredModule.status;
        registeredModule.status = status;
        if (error !== undefined) {
            registeredModule.error = error;
        }
        else if (status !== 'error') {
            // Clear error when status is not error
            delete registeredModule.error;
        }
        // Emit appropriate events
        if (status === 'initialized' && oldStatus === 'initializing') {
            this.eventBus.emit('module:started', name);
        }
        else if (status === 'started' && oldStatus === 'starting') {
            this.eventBus.emit('module:started', name);
        }
        else if (status === 'stopped' && oldStatus === 'stopping') {
            this.eventBus.emit('module:stopped', name);
        }
        else if (status === 'error') {
            this.eventBus.emit('module:error', name, error);
        }
    }
    /**
     * Get module status
     */
    getStatus(name) {
        return this.modules.get(name)?.status;
    }
    /**
     * Check if all modules are in a specific status
     */
    allModulesStatus(status) {
        return this.getAll().every(m => m.status === status);
    }
    /**
     * Get modules with error status
     */
    getErrorModules() {
        return this.getAll().filter(m => m.status === 'error');
    }
    /**
     * Run health checks on all modules
     */
    async runHealthChecks() {
        const checks = [];
        let overallStatus = 'healthy';
        for (const registered of this.getAll()) {
            if (registered.status === 'destroyed' || !registered.config.enabled) {
                continue;
            }
            try {
                const result = await registered.module.healthCheck();
                checks.push(...result.checks);
                if (result.status === 'unhealthy') {
                    overallStatus = 'unhealthy';
                }
                else if (result.status === 'degraded' && overallStatus === 'healthy') {
                    overallStatus = 'degraded';
                }
            }
            catch (error) {
                checks.push({
                    name: registered.module.name,
                    status: 'fail',
                    message: error instanceof Error ? error.message : 'Health check failed',
                });
                overallStatus = 'unhealthy';
            }
        }
        return {
            status: overallStatus,
            checks,
            timestamp: new Date(),
        };
    }
    /**
     * Unregister a module
     */
    unregister(name) {
        const module = this.modules.get(name);
        if (!module) {
            return false;
        }
        this.modules.delete(name);
        this.eventBus.emit('module:unregistered', name);
        return true;
    }
    /**
     * Clear all modules
     */
    clear() {
        this.modules.clear();
        this.initializationOrder = [];
    }
    /**
     * Get count of registered modules
     */
    size() {
        return this.modules.size;
    }
}
exports.ModuleRegistry = ModuleRegistry;
//# sourceMappingURL=module-registry.js.map