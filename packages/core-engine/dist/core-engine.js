"use strict";
/**
 * Core Engine - Main entry point for Board Plugin
 * Manages plugin lifecycle, modules, and event bus
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreEngine = void 0;
exports.createCoreEngine = createCoreEngine;
const pino_1 = __importDefault(require("pino"));
const event_bus_js_1 = require("./event-bus.js");
const module_registry_js_1 = require("./module-registry.js");
class CoreEngine {
    config;
    logger;
    eventBus;
    moduleRegistry;
    status = 'created';
    startTime;
    constructor(options) {
        this.config = options.config;
        this.logger = options.logger || this.createDefaultLogger();
        this.eventBus = new event_bus_js_1.EventBus();
        this.moduleRegistry = new module_registry_js_1.ModuleRegistry(this.eventBus);
    }
    /**
     * Create default logger
     */
    createDefaultLogger() {
        const options = {
            level: this.config.logging.level,
        };
        if (this.config.logging.prettyPrint) {
            options.transport = {
                target: 'pino-pretty',
                options: { colorize: true },
            };
        }
        return (0, pino_1.default)(options);
    }
    /**
     * Get the event bus
     */
    getEventBus() {
        return this.eventBus;
    }
    /**
     * Get the module registry
     */
    getModuleRegistry() {
        return this.moduleRegistry;
    }
    /**
     * Get the logger
     */
    getLogger() {
        return this.logger;
    }
    /**
     * Get current status
     */
    getStatus() {
        return this.status;
    }
    /**
     * Get configuration
     */
    getConfig() {
        return this.config;
    }
    /**
     * Initialize the core engine and all modules
     */
    async initialize() {
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
                }
                catch (error) {
                    this.moduleRegistry.setStatus(name, 'error', error instanceof Error ? error : new Error(String(error)));
                    this.logger.error({ module: name, error }, 'Module initialization failed');
                    throw error;
                }
            }
            this.status = 'initialized';
            this.logger.info('Core engine initialized successfully');
        }
        catch (error) {
            this.status = 'created';
            this.logger.error({ error }, 'Core engine initialization failed');
            throw error;
        }
    }
    /**
     * Start the core engine and all modules
     */
    async start() {
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
                }
                catch (error) {
                    this.moduleRegistry.setStatus(name, 'error', error instanceof Error ? error : new Error(String(error)));
                    this.logger.error({ module: name, error }, 'Module start failed');
                    throw error;
                }
            }
            this.status = 'started';
            this.eventBus.emit('core:started');
            this.logger.info({ uptime: Date.now() - this.startTime.getTime() }, 'Core engine started successfully');
        }
        catch (error) {
            this.status = 'initialized';
            this.logger.error({ error }, 'Core engine start failed');
            throw error;
        }
    }
    /**
     * Stop the core engine and all modules
     */
    async stop() {
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
            }
            catch (error) {
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
    async destroy() {
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
            }
            catch (error) {
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
    registerModule(module, config) {
        if (this.status !== 'created' && this.status !== 'initializing') {
            throw new Error(`Cannot register module after initialization (status: ${this.status})`);
        }
        this.moduleRegistry.register(module, config);
        this.logger.debug({ module: module.name }, 'Module registered');
    }
    /**
     * Run health checks on all modules
     */
    async healthCheck() {
        return this.moduleRegistry.runHealthChecks();
    }
    /**
     * Get uptime in milliseconds
     */
    getUptime() {
        if (!this.startTime) {
            return 0;
        }
        return Date.now() - this.startTime.getTime();
    }
    /**
     * Subscribe to core events
     */
    on(event, listener) {
        this.eventBus.on(event, listener);
        return this;
    }
    /**
     * Unsubscribe from core events
     */
    off(event, listener) {
        this.eventBus.off(event, listener);
        return this;
    }
    /**
     * Create a child logger for a module
     */
    createChildLogger(moduleName) {
        return this.logger.child({ module: moduleName });
    }
}
exports.CoreEngine = CoreEngine;
/**
 * Create a core engine with default configuration
 */
async function createCoreEngine(config = {}) {
    const defaultConfig = {
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
//# sourceMappingURL=core-engine.js.map