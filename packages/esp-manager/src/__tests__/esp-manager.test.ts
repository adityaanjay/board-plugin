/**
 * ESP Manager tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createEspManager } from '../esp-manager.js';
import { createBoardDatabase } from '@board/board-database';
import { CoreEngineStatus } from '@board/core-engine';

describe('EspManager', () => {
  const boardDatabase = createBoardDatabase();
  let manager: ReturnType<typeof createEspManager>;

  beforeEach(() => {
    manager = createEspManager(
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

  it('should create an esp manager instance', () => {
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
    manager.on('flash:start', listener);
    manager.off('flash:start', listener);
  });

  it('should get board info from database', () => {
    const info = manager.getBoardInfo('esp32_devkit');
    expect(info.board).toBeDefined();
    expect(info.variant).toBeDefined();
    expect(info.board?.id).toBe('esp32_devkit');
  });

  it('should get esptool chip for board', () => {
    const chip = manager.getEsptoolChip('esp32_devkit');
    expect(chip).toBe('esp32');

    const s3Chip = manager.getEsptoolChip('esp32_s3');
    expect(s3Chip).toBe('esp32s3');
  });

  it('should return undefined for non-existent board', () => {
    const info = manager.getBoardInfo('non_existent_board');
    expect(info.board).toBeUndefined();
    expect(info.variant).toBeUndefined();

    const chip = manager.getEsptoolChip('non_existent_board');
    expect(chip).toBeUndefined();
  });

  it('should initialize with board database', () => {
    expect(manager.getBoardInfo('esp32_devkit').board).toBeDefined();
  });

  it('should set board database', () => {
    const newDb = createBoardDatabase();
    manager.setBoardDatabase(newDb);
    expect(manager.getBoardInfo('esp32_devkit').board).toBeDefined();
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