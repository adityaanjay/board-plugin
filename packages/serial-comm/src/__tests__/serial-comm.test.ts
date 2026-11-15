/**
 * Serial Communication tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSerialManager } from '../serial-manager.js';
import { SerialConnectionState } from '../types.js';

describe('SerialManager', () => {
  let manager: ReturnType<typeof createSerialManager>;

  beforeEach(() => {
    manager = createSerialManager({
      autoConnect: false,
      defaultBaudRate: 115200,
      bufferSize: 4096,
    });
  });

  afterEach(async () => {
    await manager.destroy();
  });

  it('should create a serial manager instance', () => {
    expect(manager).toBeDefined();
  });

  it('should initialize successfully', async () => {
    await manager.initialize();
    expect(manager.getStatus()).toBe('initialized');
  });

  it('should start successfully', async () => {
    await manager.initialize();
    await manager.start();
    expect(manager.getStatus()).toBe('started');
  });

  it('should stop successfully', async () => {
    await manager.initialize();
    await manager.start();
    await manager.stop();
    expect(manager.getStatus()).toBe('stopped');
  });

  it('should destroy successfully', async () => {
    await manager.initialize();
    await manager.start();
    await manager.stop();
    await manager.destroy();
    expect(manager.getStatus()).toBe('destroyed');
  });

  it('should have empty connections list initially', () => {
    const connections = manager.getAllConnections();
    expect(Array.isArray(connections)).toBe(true);
    expect(connections.length).toBe(0);
  });

  it('should have event emitter', () => {
    const emitter = manager.getEmitter();
    expect(emitter).toBeDefined();
    expect(typeof emitter.on).toBe('function');
    expect(typeof emitter.emit).toBe('function');
  });

  it('should subscribe to connection events', () => {
    const listener = vi.fn();
    manager.on('connection:opened', listener);
    manager.off('connection:opened', listener);
  });

  it('should subscribe to data events', () => {
    const listener = vi.fn();
    manager.on('data', listener);
    manager.off('data', listener);
  });

  it('should health check', async () => {
    await manager.initialize();
    const health = await manager.healthCheck();
    expect(health).toBeDefined();
    expect(health.status).toBeDefined();
    expect(Array.isArray(health.checks)).toBe(true);
    expect(health.timestamp).toBeInstanceOf(Date);
  });

  it('should list available ports', async () => {
    await manager.initialize();
    // Use the static method from SerialPort since the manager doesn't have listPorts
    const { SerialPort } = await import('serialport');
    const ports = await SerialPort.list();
    expect(Array.isArray(ports)).toBe(true);
  });
});