/**
 * Configuration Manager
 * Handles loading, validation, migration, and type-safe access to configuration
 */

import { readFile, writeFile, access, constants } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import * as yaml from 'yaml';
import { deepmerge } from './utils.js';
import {
  BoardPluginConfig,
  BaseConfigSchema,
  ConfigLoadResult,
  ConfigValidationResult,
  ConfigSource,
} from './types.js';

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: BoardPluginConfig = {
  version: 1,
  arduino: {
    autoInstall: true,
    boardManagerUrls: [
      'https://downloads.arduino.cc/packages/package_index.json',
      'https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json',
    ],
    defaultFqbn: 'arduino:avr:uno',
    libraryPaths: [],
  },
  esp: {
    autoInstall: true,
    defaultBaudRate: 921600,
    flashMode: 'dio',
    flashFreq: '40m',
    flashSize: '4MB',
  },
  platformio: {},
  serial: {
    defaultBaudRate: 115200,
    defaultTimeout: 5000,
    maxBufferSize: 65536,
    reconnectAttempts: 3,
    reconnectDelay: 1000,
  },
  compiler: {
    defaultOptimization: 'release',
    defaultWarnings: 'default',
    cacheEnabled: true,
    cacheDir: '.board/cache',
    parallelJobs: 4,
  },
  uploader: {
    verifyAfterUpload: true,
    defaultBaudRate: 115200,
    eraseBeforeUpload: false,
    resetMethod: 'dtr',
  },
  debugger: {
    enableSerialMonitor: true,
    logDir: '.board/logs',
    maxLogFiles: 10,
    maxLogSize: 10,
    crashDetectionEnabled: true,
    bootLoopDetectionEnabled: true,
  },
  autofix: {
    maxAttempts: 5,
    enabled: true,
    backupOriginal: true,
    strategies: [],
    timeout: 300,
  },
  libraries: {
    autoInstall: true,
    searchPaths: [],
    preferredSources: ['arduino', 'platformio', 'github'],
    versionPolicy: 'compatible',
  },
  integrations: {
    claudeCode: {
      enabled: true,
      mcpServerName: 'board-plugin',
      autoRegister: true,
    },
    opencode: {
      enabled: true,
      mcpServerName: 'board-plugin',
      autoRegister: true,
    },
  },
  logging: {
    level: 'info',
    console: true,
    file: true,
    filePath: '.board/logs/board-plugin.log',
    maxFiles: 10,
    maxSize: 10,
  },
};

/**
 * Configuration file paths in order of priority (highest first)
 */
const CONFIG_PATHS: ConfigSource[] = [
  // Project-local config
  { path: 'board.config.json', priority: 100, format: 'json' },
  { path: 'board.config.yaml', priority: 99, format: 'yaml' },
  { path: 'board.config.yml', priority: 98, format: 'yaml' },
  { path: '.board/config.json', priority: 97, format: 'json' },
  { path: '.board/config.yaml', priority: 96, format: 'yaml' },
  { path: '.board/config.yml', priority: 95, format: 'yaml' },
  // User home config
  { path: join(homedir(), '.board', 'config.json'), priority: 50, format: 'json' },
  { path: join(homedir(), '.board', 'config.yaml'), priority: 49, format: 'yaml' },
  { path: join(homedir(), '.board', 'config.yml'), priority: 48, format: 'yaml' },
  // System config
  { path: '/etc/board/config.json', priority: 10, format: 'json' },
  { path: '/etc/board/config.yaml', priority: 9, format: 'yaml' },
];

/**
 * Configuration Manager class
 */
export class ConfigManager {
  private config: BoardPluginConfig = DEFAULT_CONFIG;
  private sources: ConfigSource[] = [];
  private validated = false;

  /**
   * Get the current configuration
   */
  getConfig(): BoardPluginConfig {
    return this.config;
  }

  /**
   * Get configuration sources
   */
  getSources(): ConfigSource[] {
    return [...this.sources];
  }

  /**
   * Load configuration from all sources
   */
  async load(customPaths?: ConfigSource[]): Promise<ConfigLoadResult> {
    const paths = customPaths || CONFIG_PATHS;
    const loadedConfigs: Partial<BoardPluginConfig>[] = [];
    const sources: ConfigSource[] = [];
    const warnings: string[] = [];

    // Load from each path in priority order
    for (const source of paths) {
      try {
        await access(source.path, constants.R_OK);
        const content = await readFile(source.path, 'utf-8');
        let parsed: Partial<BoardPluginConfig>;

        if (source.format === 'json') {
          parsed = JSON.parse(content);
        } else {
          parsed = yaml.parse(content);
        }

        loadedConfigs.push(parsed);
        sources.push(source);
      } catch (error) {
        // File doesn't exist or can't be read - skip silently
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          warnings.push(`Failed to load config from ${source.path}: ${error}`);
        }
      }
    }

    // Also check for environment variable overrides
    const envConfig = this.loadFromEnvironment();
    if (Object.keys(envConfig).length > 0) {
      loadedConfigs.push(envConfig);
      sources.push({ path: 'environment', priority: 200, format: 'json' });
    }

    // Merge configs (highest priority last)
    let merged = DEFAULT_CONFIG;
    for (const cfg of loadedConfigs) {
      merged = deepmerge(merged, cfg);
    }

    // Validate merged config
    const validation = this.validate(merged);
    if (!validation.valid) {
      throw new Error(`Configuration validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Apply migrations if needed
    merged = this.migrate(merged);

    this.config = merged;
    this.sources = sources;
    this.validated = true;

    return {
      config: this.config,
      sources,
      warnings,
    };
  }

  /**
   * Load configuration from environment variables
   */
  private loadFromEnvironment(): Partial<BoardPluginConfig> {
    const envConfig: Partial<BoardPluginConfig> = {};

    // Map environment variables to config paths
    const envMappings: Record<string, string> = {
      'BOARD_ARDUINO_CLI_PATH': 'arduino.cliPath',
      'BOARD_ARDUINO_AUTO_INSTALL': 'arduino.autoInstall',
      'BOARD_ARDUINO_DEFAULT_FQBN': 'arduino.defaultFqbn',
      'BOARD_ESP_ESPTOOL_PATH': 'esp.esptoolPath',
      'BOARD_ESP_DEFAULT_BAUD': 'esp.defaultBaudRate',
      'BOARD_SERIAL_DEFAULT_BAUD': 'serial.defaultBaudRate',
      'BOARD_COMPILER_OPTIMIZATION': 'compiler.defaultOptimization',
      'BOARD_LOG_LEVEL': 'logging.level',
      'BOARD_CLAUDE_CODE_ENABLED': 'integrations.claudeCode.enabled',
      'BOARD_OPENCODE_ENABLED': 'integrations.opencode.enabled',
    };

    for (const [envKey, configPath] of Object.entries(envMappings)) {
      const value = process.env[envKey];
      if (value !== undefined) {
        this.setNestedValue(envConfig, configPath, this.parseEnvValue(value));
      }
    }

    return envConfig;
  }

  /**
   * Parse environment variable value
   */
  private parseEnvValue(value: string): unknown {
    // Try to parse as JSON first
    try {
      return JSON.parse(value);
    } catch {
      // Return as string
      return value;
    }
  }

  /**
   * Set nested value in object using dot notation
   */
  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    let current: Record<string, unknown> = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]!; // i is guaranteed to be valid index by loop condition
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    const lastKey = keys[keys.length - 1]!; // length >= 1 guaranteed
    current[lastKey] = value;
  }

  /**
   * Validate configuration against schema
   */
  validate(config: Partial<BoardPluginConfig>): ConfigValidationResult {
    const result = BaseConfigSchema.safeParse(config);

    if (result.success) {
      return { valid: true, errors: [], warnings: [] };
    }

    return {
      valid: false,
      errors: result.error.issues,
      warnings: [],
    };
  }

  /**
   * Migrate configuration to current version
   */
  migrate(config: BoardPluginConfig): BoardPluginConfig {
    let migrated = { ...config };

    // Version 1 is current, no migrations needed yet
    if (migrated.version < 1) {
      migrated.version = 1;
    }

    return migrated;
  }

  /**
   * Get a typed configuration value
   */
  get<T>(path: string): T | undefined {
    const keys = path.split('.');
    let current: unknown = this.config;

    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return current as T;
  }

  /**
   * Set a configuration value (runtime only, not persisted)
   */
  set(path: string, value: unknown): void {
    this.setNestedValue(this.config as Record<string, unknown>, path, value);
  }

  /**
   * Save configuration to a file
   */
  async save(path: string, format: 'json' | 'yaml' = 'json'): Promise<void> {
    const content = format === 'json'
      ? JSON.stringify(this.config, null, 2)
      : yaml.stringify(this.config);

    await writeFile(path, content, 'utf-8');
  }

  /**
   * Generate JSON schema for the configuration
   */
  async generateSchema(): Promise<object> {
    // Import zod-to-json-schema dynamically to avoid circular dependency
    const { zodToJsonSchema } = await import('zod-to-json-schema');
    return zodToJsonSchema(BaseConfigSchema, { target: 'jsonSchema7' });
  }

  /**
   * Check if configuration has been loaded and validated
   */
  isLoaded(): boolean {
    return this.validated;
  }

  /**
   * Reset configuration to defaults
   */
  reset(): void {
    this.config = DEFAULT_CONFIG;
    this.sources = [];
    this.validated = false;
  }
}

/**
 * Create and load configuration manager
 */
export async function createConfigManager(customPaths?: ConfigSource[]): Promise<ConfigManager> {
  const manager = new ConfigManager();
  await manager.load(customPaths);
  return manager;
}