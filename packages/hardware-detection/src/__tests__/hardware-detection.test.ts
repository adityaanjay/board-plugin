/**
 * Hardware Detection tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHardwareDetector } from '../hardware-detector.js';
import { createBoardDatabase } from '@board/board-database';

describe('HardwareDetector', () => {
  const boardDatabase = createBoardDatabase();
  let detector: ReturnType<typeof createHardwareDetector>;

  beforeEach(() => {
    detector = createHardwareDetector({
      boardDatabase,
      config: {
        scanInterval: 1000,
        autoScan: false,
        watchedVidPids: [],
      },
    });
  });

  afterEach(async () => {
    await detector.destroy();
  });

  it('should create a hardware detector instance', () => {
    expect(detector).toBeDefined();
  });

  it('should initialize successfully', async () => {
    await detector.initialize({} as any);
    expect(detector.getStatus()).toBe('initialized');
  });

  it('should start successfully', async () => {
    await detector.initialize({} as any);
    await detector.start();
    expect(detector.getStatus()).toBe('started');
  });

  it('should stop successfully', async () => {
    await detector.initialize({} as any);
    await detector.start();
    await detector.stop();
    expect(detector.getStatus()).toBe('stopped');
  });

  it('should get empty devices list initially', () => {
    const devices = detector.getDevices();
    expect(Array.isArray(devices)).toBe(true);
  });

  it('should have event emitter', () => {
    const emitter = detector.getEmitter();
    expect(emitter).toBeDefined();
    expect(typeof emitter.on).toBe('function');
    expect(typeof emitter.emit).toBe('function');
  });

  it('should subscribe to device events', () => {
    const listener = vi.fn();
    detector.on('device:added', listener);
    detector.off('device:added', listener);
  });

  it('should trigger manual scan', async () => {
    await detector.initialize({} as any);
    const result = await detector.triggerScan();
    expect(result).toBeDefined();
    expect(Array.isArray(result.devices)).toBe(true);
  });

  it('should destroy successfully', async () => {
    await detector.initialize({} as any);
    await detector.start();
    await detector.destroy();
    expect(detector.getStatus()).toBe('destroyed');
  });

  it('should health check', async () => {
    await detector.initialize({} as any);
    const health = await detector.healthCheck();
    expect(health).toBeDefined();
    expect(health.status).toBeDefined();
    expect(Array.isArray(health.checks)).toBe(true);
    expect(health.timestamp).toBeInstanceOf(Date);
  });
});