/**
 * Config Manager tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfigManager, createConfigManager } from '../config-manager.js';
import { CONFIG_SCHEMA_VERSION, ArduinoConfigSchema } from '../types.js';

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(async () => {
    configManager = await createConfigManager();
  });

  afterEach(() => {
    // ConfigManager doesn't have clearCache, just create new instance
  });

  it('should create a config manager instance', () => {
    expect(configManager).toBeInstanceOf(ConfigManager);
  });

  it('should get default config', () => {
    // ConfigManager doesn't have getConfig(), but we can use get()
    const arduino = configManager.get('arduino');
    expect(arduino).toBeDefined();
    expect(arduino.autoInstall).toBeDefined();
    expect(arduino.defaultFqbn).toBeDefined();
  });

  it('should validate Arduino config with defaults', () => {
    const result = ArduinoConfigSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.boardManagerUrls).toEqual([
        'https://downloads.arduino.cc/packages/package_index.json',
        'https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json',
      ]);
      expect(result.data.defaultFqbn).toBe('arduino:avr:uno');
      expect(result.data.autoInstall).toBe(true);
    }
  });

  it('should get and set nested config values', () => {
    configManager.set('arduino.verbose', true);
    expect(configManager.get('arduino.verbose')).toBe(true);

    configManager.set('arduino.buildOptions.optimization', 'size');
    expect(configManager.get('arduino.buildOptions.optimization')).toBe('size');
  });

  it('should validate config schema version', () => {
    expect(CONFIG_SCHEMA_VERSION).toBe(1);
  });

  it('should load config from file', async () => {
    const fs = await import('fs-extra');
    const path = await import('path');
    const os = await import('os');

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'config-test-'));
    const configPath = path.join(tempDir, 'test-config.json');

    const testConfig = {
      arduino: {
        cliPath: '/custom/path',
        defaultFqbn: 'arduino:avr:nano',
      },
      logging: {
        level: 'debug',
      },
    };

    await fs.writeJson(configPath, testConfig);

    // Create new manager and load from file
    const newManager = await createConfigManager([{ type: 'file', path: configPath }]);
    const loadedArduino = newManager.get('arduino');
    expect(loadedArduino?.cliPath).toBe('/custom/path');
    expect(loadedArduino?.defaultFqbn).toBe('arduino:avr:nano');
    const loadedLogging = newManager.get('logging');
    expect(loadedLogging?.level).toBe('debug');

    await fs.remove(tempDir);
  });
});