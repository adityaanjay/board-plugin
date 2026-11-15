/**
 * PlatformIO Manager tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPlatformIOManager } from '../platformio-manager.js';
import { createBoardDatabase } from '@board/board-database';
import { CoreEngineStatus } from '@board/core-engine';

describe('PlatformIOManager', () => {
  const boardDatabase = createBoardDatabase();
  let manager: ReturnType<typeof createPlatformIOManager>;

  beforeEach(() => {
    manager = createPlatformIOManager(
      {
        config: {
          autoInstall: false,
        },
      },
      boardDatabase
    );
  });

  afterEach(async () => {
    await manager.destroy();
  });

  it('should create a platformio manager instance', () => {
    expect(manager).toBeDefined();
  });

  it('should have initial status as created', () => {
    expect(manager.getStatus()).toBe('created');
  });

  it('should have event emitter', () => {
    const emitter = manager.getEmitter();
    expect(emitter).toBeDefined();
    expect(typeof emitter.on).toBe('function');
    expect(typeof emitter.emit).toBe('function');
  });

  it('should subscribe to events', () => {
    const listener = vi.fn();
    manager.on('build:start', listener);
    manager.off('build:start', listener);
  });

  it('should get board info from database', () => {
    const info = manager.getBoardInfo('arduino_uno');
    expect(info.board).toBeDefined();
    expect(info.variant).toBeDefined();
    expect(info.board?.id).toBe('arduino_uno');
  });

  it('should get PlatformIO board ID for board', () => {
    const pioBoard = manager.getPlatformIOBoard('arduino_uno');
    expect(pioBoard).toBe('uno');

    const esp32Pio = manager.getPlatformIOBoard('esp32_devkit');
    expect(esp32Pio).toBe('esp32dev');
  });

  it('should return undefined for non-existent board', () => {
    const info = manager.getBoardInfo('non_existent_board');
    expect(info.board).toBeUndefined();
    expect(info.variant).toBeUndefined();

    const pioBoard = manager.getPlatformIOBoard('non_existent_board');
    expect(pioBoard).toBeUndefined();
  });

  it('should initialize with board database', () => {
    expect(manager.getBoardInfo('arduino_uno').board).toBeDefined();
  });

  it('should set board database', () => {
    const newDb = createBoardDatabase();
    manager.setBoardDatabase(newDb);
    expect(manager.getBoardInfo('arduino_uno').board).toBeDefined();
  });

  it('should set hardware detector', () => {
    // Just test that the method exists and doesn't throw
    expect(() => manager.setHardwareDetector(null as any)).not.toThrow();
  });

  it('should set serial manager', () => {
    // Just test that the method exists and doesn't throw
    expect(() => manager.setSerialManager(null as any)).not.toThrow();
  });
});