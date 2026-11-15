/**
 * Core Engine tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CoreEngine, CoreConfig } from '../core-engine.js';
import { EventBus } from '../event-bus.js';
import { ModuleRegistry } from '../module-registry.js';

describe('CoreEngine', () => {
  let engine: CoreEngine;

  beforeEach(async () => {
    // Create CoreEngine directly without auto-initialization
    const defaultConfig: CoreConfig = {
      modules: [],
      logging: {
        level: 'silent',
        prettyPrint: false,
        destination: 'stdout',
      },
      eventBus: {
        maxListeners: 100,
        captureRejections: true,
      },
    };
    engine = new CoreEngine({ config: defaultConfig });
  });

  afterEach(async () => {
    if (engine) {
      await engine.destroy();
    }
  });

  it('should create a core engine instance', () => {
    expect(engine).toBeInstanceOf(CoreEngine);
  });

  it('should have initial status as created', () => {
    expect(engine.getStatus()).toBe('created');
  });

  it('should initialize successfully', async () => {
    await engine.initialize();
    expect(engine.getStatus()).toBe('initialized');
  });

  it('should start successfully', async () => {
    await engine.initialize();
    await engine.start();
    expect(engine.getStatus()).toBe('started');
  });

  it('should stop successfully', async () => {
    await engine.initialize();
    await engine.start();
    await engine.stop();
    expect(engine.getStatus()).toBe('stopped');
  });

  it('should destroy successfully', async () => {
    await engine.initialize();
    await engine.start();
    await engine.stop();
    await engine.destroy();
    expect(engine.getStatus()).toBe('destroyed');
  });

  it('should register and retrieve modules before initialization', () => {
    const mockModule = {
      name: 'test-module',
      version: '1.0.0',
      dependencies: [] as string[],
      initialize: vi.fn().mockResolvedValue(undefined),
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn().mockResolvedValue(undefined),
      getStatus: vi.fn().mockReturnValue('started'),
      healthCheck: vi.fn().mockResolvedValue({ status: 'healthy', checks: [], timestamp: new Date() }),
    };

    engine.registerModule(mockModule as any, { enabled: true });
    const retrieved = engine.getModuleRegistry().get('test-module');
    expect(retrieved?.module).toBe(mockModule);
  });

  it('should emit events through event bus', async () => {
    await engine.initialize();
    const eventBus = engine.getEventBus();
    const listener = vi.fn();

    eventBus.on('test:event', listener);
    eventBus.emit('test:event', 'test-data');

    expect(listener).toHaveBeenCalledWith('test-data');
  });
});

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  it('should subscribe and emit events', () => {
    const listener = vi.fn();
    eventBus.on('test', listener);
    eventBus.emit('test', 'data');
    expect(listener).toHaveBeenCalledWith('data');
  });

  it('should unsubscribe from events', () => {
    const listener = vi.fn();
    eventBus.on('test', listener);
    eventBus.off('test', listener);
    eventBus.emit('test', 'data');
    expect(listener).not.toHaveBeenCalled();
  });

  it('should call once listener only once', () => {
    const listener = vi.fn();
    eventBus.once('test', listener);
    eventBus.emit('test', 'data1');
    eventBus.emit('test', 'data2');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('data1');
  });
});

describe('ModuleRegistry', () => {
  let registry: ModuleRegistry;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    registry = new ModuleRegistry(eventBus);
  });

  it('should register and retrieve modules', () => {
    const mockModule = {
      name: 'test-module',
      version: '1.0.0',
      dependencies: ['dep1'] as string[],
      initialize: vi.fn().mockResolvedValue(undefined),
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn().mockResolvedValue(undefined),
      getStatus: vi.fn().mockReturnValue('started'),
      healthCheck: vi.fn().mockResolvedValue({ status: 'healthy', checks: [], timestamp: new Date() }),
    };

    registry.register(mockModule as any, { enabled: true });
    const retrieved = registry.get('test-module');
    expect(retrieved).toBeDefined();
    expect(retrieved?.module).toBe(mockModule);
  });

  it('should calculate initialization order correctly', () => {
    const modA = { name: 'mod-a', version: '1.0.0', dependencies: [] as string[], initialize: vi.fn(), start: vi.fn(), stop: vi.fn(), destroy: vi.fn(), getStatus: vi.fn(), healthCheck: vi.fn() };
    const modB = { name: 'mod-b', version: '1.0.0', dependencies: ['mod-a'] as string[], initialize: vi.fn(), start: vi.fn(), stop: vi.fn(), destroy: vi.fn(), getStatus: vi.fn(), healthCheck: vi.fn() };
    const modC = { name: 'mod-c', version: '1.0.0', dependencies: ['mod-b'] as string[], initialize: vi.fn(), start: vi.fn(), stop: vi.fn(), destroy: vi.fn(), getStatus: vi.fn(), healthCheck: vi.fn() };

    registry.register(modA as any, { enabled: true, config: { dependencies: [] } });
    registry.register(modB as any, { enabled: true, config: { dependencies: ['mod-a'] } });
    registry.register(modC as any, { enabled: true, config: { dependencies: ['mod-b'] } });

    const order = registry.calculateInitializationOrder();
    expect(order.indexOf('mod-a')).toBeLessThan(order.indexOf('mod-b'));
    expect(order.indexOf('mod-b')).toBeLessThan(order.indexOf('mod-c'));
  });

  it('should detect circular dependencies', () => {
    const modA = { name: 'mod-a', version: '1.0.0', dependencies: ['mod-b'] as string[], initialize: vi.fn(), start: vi.fn(), stop: vi.fn(), destroy: vi.fn(), getStatus: vi.fn(), healthCheck: vi.fn() };
    const modB = { name: 'mod-b', version: '1.0.0', dependencies: ['mod-a'] as string[], initialize: vi.fn(), start: vi.fn(), stop: vi.fn(), destroy: vi.fn(), getStatus: vi.fn(), healthCheck: vi.fn() };

    registry.register(modA as any, { enabled: true, config: { dependencies: ['mod-b'] } });
    registry.register(modB as any, { enabled: true, config: { dependencies: ['mod-a'] } });

    expect(() => registry.calculateInitializationOrder()).toThrow('Circular dependency detected');
  });

  it('should get initialization order', () => {
    const modA = { name: 'mod-a', version: '1.0.0', dependencies: [] as string[], initialize: vi.fn(), start: vi.fn(), stop: vi.fn(), destroy: vi.fn(), getStatus: vi.fn(), healthCheck: vi.fn() };
    registry.register(modA as any, { enabled: true, config: { dependencies: [] } });

    const order = registry.getInitializationOrder();
    expect(order).toContain('mod-a');
  });

  it('should check module status', () => {
    const modA = { name: 'mod-a', version: '1.0.0', dependencies: [] as string[], initialize: vi.fn(), start: vi.fn(), stop: vi.fn(), destroy: vi.fn(), getStatus: vi.fn(), healthCheck: vi.fn() };
    registry.register(modA as any, { enabled: true, config: { dependencies: [] } });

    const status = registry.getStatus('mod-a');
    expect(status).toBe('registered');
  });

  it('should get all modules', () => {
    const modA = { name: 'mod-a', version: '1.0.0', dependencies: [] as string[], initialize: vi.fn(), start: vi.fn(), stop: vi.fn(), destroy: vi.fn(), getStatus: vi.fn(), healthCheck: vi.fn() };
    const modB = { name: 'mod-b', version: '1.0.0', dependencies: [] as string[], initialize: vi.fn(), start: vi.fn(), stop: vi.fn(), destroy: vi.fn(), getStatus: vi.fn(), healthCheck: vi.fn() };
    registry.register(modA as any, { enabled: true, config: { dependencies: [] } });
    registry.register(modB as any, { enabled: true, config: { dependencies: [] } });

    const all = registry.getAll();
    expect(all.length).toBe(2);
  });

  it('should get module count', () => {
    expect(registry.size()).toBe(0);
    const modA = { name: 'mod-a', version: '1.0.0', dependencies: [] as string[], initialize: vi.fn(), start: vi.fn(), stop: vi.fn(), destroy: vi.fn(), getStatus: vi.fn(), healthCheck: vi.fn() };
    registry.register(modA as any, { enabled: true, config: { dependencies: [] } });
    expect(registry.size()).toBe(1);
  });
});