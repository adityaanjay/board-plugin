/**
 * Arduino Manager tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createArduinoManager } from '../arduino-manager.js';
import { createBoardDatabase } from '@board/board-database';
import { CoreEngineStatus } from '@board/core-engine';

describe('ArduinoManager', () => {
  const boardDatabase = createBoardDatabase();
  let manager: ReturnType<typeof createArduinoManager>;

  beforeEach(() => {
    manager = createArduinoManager(
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

  it('should create an arduino manager instance', () => {
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
    manager.on('compile:start', listener);
    manager.off('compile:start', listener);
  });

  it('should get board info from database', () => {
    const info = manager.getBoardInfo('arduino_uno');
    expect(info.board).toBeDefined();
    expect(info.variant).toBeDefined();
    expect(info.board?.id).toBe('arduino_uno');
  });

  it('should get FQBN for board', () => {
    const fqbn = manager.getFqbn('arduino_uno');
    expect(fqbn).toBe('arduino:avr:uno');

    const esp32Fqbn = manager.getFqbn('esp32_devkit');
    expect(esp32Fqbn).toContain('esp32');
  });

  it('should return undefined for non-existent board', () => {
    const info = manager.getBoardInfo('non_existent_board');
    expect(info.board).toBeUndefined();
    expect(info.variant).toBeUndefined();

    const fqbn = manager.getFqbn('non_existent_board');
    expect(fqbn).toBeUndefined();
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