/**
 * Module Registry for Core Engine
 * Manages module registration, dependency resolution, and lifecycle
 */

import type { Module, ModuleConfig, ModuleHealthCheck, HealthCheckResult } from './types.js';
import { EventBus } from './event-bus.js';

export interface RegisteredModule {
  module: Module;
  config: ModuleConfig;
  status: 'registered' | 'initializing' | 'initialized' | 'starting' | 'started' | 'stopping' | 'stopped' | 'destroyed' | 'error';
  error?: Error;
  dependencies: string[];
  dependents: string[];
}

export class ModuleRegistry {
  private modules = new Map<string, RegisteredModule>();
  private eventBus: EventBus;
  private initializationOrder: string[] = [];

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Register a module with its configuration
   */
  register(module: Module, config: ModuleConfig): void {
    if (this.modules.has(module.name)) {
      throw new Error(`Module ${module.name} is already registered`);
    }

    const registeredModule: RegisteredModule = {
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
  private extractDependencies(config: ModuleConfig): string[] {
    // Dependencies can be specified in config.dependencies or inferred from priority
    return (config.config?.dependencies as string[]) || [];
  }

  /**
   * Get a registered module by name
   */
  get(name: string): RegisteredModule | undefined {
    return this.modules.get(name);
  }

  /**
   * Get all registered modules
   */
  getAll(): RegisteredModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get modules sorted by priority (highest first)
   */
  getSortedByPriority(): RegisteredModule[] {
    return this.getAll().sort((a, b) => b.config.priority - a.config.priority);
  }

  /**
   * Calculate initialization order using topological sort
   */
  calculateInitializationOrder(): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (name: string): void => {
      if (visited.has(name)) return;
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
  getInitializationOrder(): string[] {
    if (this.initializationOrder.length === 0) {
      return this.calculateInitializationOrder();
    }
    return this.initializationOrder;
  }

  /**
   * Update module status
   */
  setStatus(name: string, status: RegisteredModule['status'], error?: Error): void {
    const registeredModule = this.modules.get(name);
    if (!registeredModule) {
      throw new Error(`Module ${name} not found`);
    }

    const oldStatus = registeredModule.status;
    registeredModule.status = status;
    if (error !== undefined) {
      registeredModule.error = error;
    } else if (status !== 'error') {
      // Clear error when status is not error
      delete registeredModule.error;
    }

    // Emit appropriate events
    if (status === 'initialized' && oldStatus === 'initializing') {
      this.eventBus.emit('module:started', name);
    } else if (status === 'started' && oldStatus === 'starting') {
      this.eventBus.emit('module:started', name);
    } else if (status === 'stopped' && oldStatus === 'stopping') {
      this.eventBus.emit('module:stopped', name);
    } else if (status === 'error') {
      this.eventBus.emit('module:error', name, error!);
    }
  }

  /**
   * Get module status
   */
  getStatus(name: string): RegisteredModule['status'] | undefined {
    return this.modules.get(name)?.status;
  }

  /**
   * Check if all modules are in a specific status
   */
  allModulesStatus(status: RegisteredModule['status']): boolean {
    return this.getAll().every(m => m.status === status);
  }

  /**
   * Get modules with error status
   */
  getErrorModules(): RegisteredModule[] {
    return this.getAll().filter(m => m.status === 'error');
  }

  /**
   * Run health checks on all modules
   */
  async runHealthChecks(): Promise<HealthCheckResult> {
    const checks: ModuleHealthCheck[] = [];
    let overallStatus: HealthCheckResult['status'] = 'healthy';

    for (const registered of this.getAll()) {
      if (registered.status === 'destroyed' || !registered.config.enabled) {
        continue;
      }

      try {
        const result = await registered.module.healthCheck();
        checks.push(...result.checks);

        if (result.status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (result.status === 'degraded' && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      } catch (error) {
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
  unregister(name: string): boolean {
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
  clear(): void {
    this.modules.clear();
    this.initializationOrder = [];
  }

  /**
   * Get count of registered modules
   */
  size(): number {
    return this.modules.size;
  }
}