/**
 * Core Engine - Main entry point for Board Plugin
 * Manages plugin lifecycle, modules, and event bus
 */

import pino, { Logger } from 'pino';
import type { CoreConfig, Module, HealthCheckResult, CoreEvent, CoreEventListener } from './types.js';
import { EventBus } from './event-bus.js';
import { ModuleRegistry } from './module-registry.js';

export interface CoreEngineOptions {
  config: CoreConfig;
  logger?: Logger;
}

export class CoreEngine {
  private config: CoreConfig;
  private logger: Logger;
  private eventBus: EventBus;
  private moduleRegistry: ModuleRegistry;
  private status: 'created' | 'initializing' | 'initialized' | 'starting' | 'started' | 'stopping' | 'stopped' | 'destroyed' = 'created';
  private startTime?: Date;

  constructor(options: CoreEngineOptions) {
    this.config = options.config;
    this.logger = options.logger || this.createDefaultLogger();
    this.eventBus = new EventBus();
    this.moduleRegistry = new ModuleRegistry(this.eventBus);
  }

  /**
   * Create default logger
   */
  private createDefaultLogger(): Logger {
    const options: pino.LoggerOptions = {
      level: this.config.logging.level,
    };

    if (this.config.logging.prettyPrint) {
      options.transport = {
        target: 'pino-pretty',
        options: { colorize: true },
      };
    }

    return pino(options);
  }

  /**
   * Get the event bus
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * Get the module registry
   */
  getModuleRegistry(): ModuleRegistry {
    return this.moduleRegistry;
  }

  /**
   * Get the logger
   */
  getLogger(): Logger {
    return this.logger;
  }

  /**
   * Get current status
   */
  getStatus(): CoreEngine['status'] {
    return this.status;
  }

  /**
   * Get configuration
   */
  getConfig(): CoreConfig {
    return this.config;
  }

  /**
   * Initialize the core engine and all modules
   */
  async initialize(): Promise<void> {
    if (this.status !== 'created') {
      throw new Error(`Core engine already initialized (status: ${this.status})`);
    }

    this.status = 'initializing';
    this.logger.info('Initializing Board Plugin Core Engine');

    try {
      // Register all enabled modules
      for (const moduleConfig of this.config.modules) {
        if (moduleConfig.enabled) {
          // Modules are registered externally via registerModule()
          this.logger.debug({ module: moduleConfig.name }, 'Module configured');
        }
      }

      // Calculate initialization order
      const initOrder = this.moduleRegistry.calculateInitializationOrder();
      this.logger.debug({ order: initOrder }, 'Module initialization order calculated');

      // Initialize modules in order
      for (const name of initOrder) {
        const registered = this.moduleRegistry.get(name);
        if (!registered || !registered.config.enabled) {
          continue;
        }

        this.moduleRegistry.setStatus(name, 'initializing');
        this.logger.debug({ module: name }, 'Initializing module');

        try {
          await registered.module.initialize(this);
          this.moduleRegistry.setStatus(name, 'initialized');
          this.logger.info({ module: name }, 'Module initialized');
        } catch (error) {
          this.moduleRegistry.setStatus(name, 'error', error instanceof Error ? error : new Error(String(error)));
          this.logger.error({ module: name, error }, 'Module initialization failed');
          throw error;
        }
      }

      this.status = 'initialized';
      this.logger.info('Core engine initialized successfully');
    } catch (error) {
      this.status = 'created';
      this.logger.error({ error }, 'Core engine initialization failed');
      throw error;
    }
  }

  /**
   * Start the core engine and all modules
   */
  async start(): Promise<void> {
    if (this.status !== 'initialized') {
      throw new Error(`Core engine not initialized (status: ${this.status})`);
    }

    this.status = 'starting';
    this.startTime = new Date();
    this.logger.info('Starting Board Plugin Core Engine');

    try {
      const initOrder = this.moduleRegistry.getInitializationOrder();

      // Start modules in order
      for (const name of initOrder) {
        const registered = this.moduleRegistry.get(name);
        if (!registered || !registered.config.enabled) {
          continue;
        }

        this.moduleRegistry.setStatus(name, 'starting');
        this.logger.debug({ module: name }, 'Starting module');

        try {
          await registered.module.start();
          this.moduleRegistry.setStatus(name, 'started');
          this.logger.info({ module: name }, 'Module started');
        } catch (error) {
          this.moduleRegistry.setStatus(name, 'error', error instanceof Error ? error : new Error(String(error)));
          this.logger.error({ module: name, error }, 'Module start failed');
          throw error;
        }
      }

      this.status = 'started';
      this.eventBus.emit('core:started');
      this.logger.info({ uptime: Date.now() - this.startTime.getTime() }, 'Core engine started successfully');
    } catch (error) {
      this.status = 'initialized';
      this.logger.error({ error }, 'Core engine start failed');
      throw error;
    }
  }

  /**
   * Stop the core engine and all modules
   */
  async stop(): Promise<void> {
    if (this.status !== 'started') {
      this.logger.warn({ status: this.status }, 'Core engine not started, skipping stop');
      return;
    }

    this.status = 'stopping';
    this.logger.info('Stopping Board Plugin Core Engine');

    // Stop modules in reverse order
    const initOrder = [...this.moduleRegistry.getInitializationOrder()].reverse();

    for (const name of initOrder) {
      const registered = this.moduleRegistry.get(name);
      if (!registered) {
        continue;
      }

      this.moduleRegistry.setStatus(name, 'stopping');
      this.logger.debug({ module: name }, 'Stopping module');

      try {
        await registered.module.stop();
        this.moduleRegistry.setStatus(name, 'stopped');
        this.logger.info({ module: name }, 'Module stopped');
      } catch (error) {
        this.logger.error({ module: name, error }, 'Module stop failed');
        // Continue stopping other modules
      }
    }

    this.status = 'stopped';
    this.eventBus.emit('core:stopped');
    this.logger.info('Core engine stopped');
  }

  /**
   * Destroy the core engine and all modules
   */
  async destroy(): Promise<void> {
    if (this.status === 'destroyed') {
      return;
    }

    this.logger.info('Destroying Board Plugin Core Engine');

    // Stop if still running
    if (this.status === 'started') {
      await this.stop();
    }

    // Destroy modules in reverse order
    const initOrder = [...this.moduleRegistry.getInitializationOrder()].reverse();

    for (const name of initOrder) {
      const registered = this.moduleRegistry.get(name);
      if (!registered) {
        continue;
      }

      try {
        await registered.module.destroy();
        this.moduleRegistry.setStatus(name, 'destroyed');
        this.logger.debug({ module: name }, 'Module destroyed');
      } catch (error) {
        this.logger.error({ module: name, error }, 'Module destroy failed');
      }
    }

    this.moduleRegistry.clear();
    this.eventBus.removeAllListeners();
    this.status = 'destroyed';
    this.logger.info('Core engine destroyed');
  }

  /**
   * Register a module with the core engine
   */
  registerModule(module: Module, config: CoreConfig['modules'][0]): void {
    if (this.status !== 'created' && this.status !== 'initializing') {
      throw new Error(`Cannot register module after initialization (status: ${this.status})`);
    }

    this.moduleRegistry.register(module, config);
    this.logger.debug({ module: module.name }, 'Module registered');
  }

  /**
   * Run health checks on all modules
   */
  async healthCheck(): Promise<HealthCheckResult> {
    return this.moduleRegistry.runHealthChecks();
  }

  /**
   * Get uptime in milliseconds
   */
  getUptime(): number {
    if (!this.startTime) {
      return 0;
    }
    return Date.now() - this.startTime.getTime();
  }

  /**
   * Subscribe to core events
   */
  on<E extends CoreEvent>(event: E, listener: CoreEventListener<E>): this {
    this.eventBus.on(event, listener);
    return this;
  }

  /**
   * Unsubscribe from core events
   */
  off<E extends CoreEvent>(event: E, listener: CoreEventListener<E>): this {
    this.eventBus.off(event, listener);
    return this;
  }

  /**
   * Create a child logger for a module
   */
  createChildLogger(moduleName: string): Logger {
    return this.logger.child({ module: moduleName });
  }
}

/**
 * Create a core engine with default configuration
 */
export async function createCoreEngine(config: Partial<CoreConfig> = {}): Promise<CoreEngine> {
  const defaultConfig: CoreConfig = {
    modules: [],
    logging: {
      level: 'info',
      prettyPrint: true,
      destination: 'stdout',
    },
    eventBus: {
      maxListeners: 100,
      captureRejections: true,
    },
    ...config,
  };

  const engine = new CoreEngine({ config: defaultConfig });
  await engine.initialize();
  return engine;
}