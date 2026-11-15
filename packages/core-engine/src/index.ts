/**
 * Core Engine - Board Plugin Core
 *
 * Main entry point for the Board Plugin core engine.
 * Provides plugin lifecycle management, event bus, and module registry.
 */

// Re-export types
export type {
  CoreEngine as CoreEngineInterface,
  CoreEngineStatus,
  Module,
  HealthCheckResult,
  ModuleHealthCheck,
  CoreConfig,
  ModuleConfig,
  LoggingConfig,
  EventBusConfig,
  CoreEvent,
  CoreEventListener,
  Logger,
} from './types.js';

// Re-export implementations
export { EventBus, createChildEventBus } from './event-bus.js';
export { ModuleRegistry } from './module-registry.js';
export { CoreEngine, createCoreEngine } from './core-engine.js';