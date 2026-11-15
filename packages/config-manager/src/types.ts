/**
 * Configuration Manager type definitions
 */

import { z } from 'zod';

/**
 * Configuration schema version
 */
export const CONFIG_SCHEMA_VERSION = 1;

/**
 * Arduino configuration schema
 */
export const ArduinoConfigSchema = z.object({
  cliPath: z.string().optional(),
  autoInstall: z.boolean().default(true),
  boardManagerUrls: z.array(z.string().url()).default([
    'https://downloads.arduino.cc/packages/package_index.json',
    'https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json',
  ]),
  defaultFqbn: z.string().default('arduino:avr:uno'),
  sketchbookPath: z.string().optional(),
  libraryPaths: z.array(z.string()).default([]),
});

export type ArduinoConfig = z.infer<typeof ArduinoConfigSchema>;

/**
 * ESP configuration schema
 */
export const EspConfigSchema = z.object({
  esptoolPath: z.string().optional(),
  espressifToolPath: z.string().optional(),
  autoInstall: z.boolean().default(true),
  defaultBaudRate: z.number().int().positive().default(921600),
  flashMode: z.enum(['dio', 'qio', 'dout', 'qout']).default('dio'),
  flashFreq: z.enum(['40m', '26m', '20m', '80m']).default('40m'),
  flashSize: z.enum(['1MB', '2MB', '4MB', '8MB', '16MB']).default('4MB'),
});

export type EspConfig = z.infer<typeof EspConfigSchema>;

/**
 * PlatformIO configuration schema
 */
export const PlatformIOConfigSchema = z.object({
  path: z.string().optional(),
  version: z.string().optional(),
  homeDir: z.string().optional(),
  platformsDir: z.string().optional(),
  packagesDir: z.string().optional(),
});

export type PlatformIOConfig = z.infer<typeof PlatformIOConfigSchema>;

/**
 * Serial configuration schema
 */
export const SerialConfigSchema = z.object({
  defaultBaudRate: z.number().int().positive().default(115200),
  defaultTimeout: z.number().int().positive().default(5000),
  maxBufferSize: z.number().int().positive().default(65536),
  reconnectAttempts: z.number().int().nonnegative().default(3),
  reconnectDelay: z.number().int().positive().default(1000),
});

export type SerialConfig = z.infer<typeof SerialConfigSchema>;

/**
 * Compiler configuration schema
 */
export const CompilerConfigSchema = z.object({
  defaultOptimization: z.enum(['debug', 'release', 'size', 'speed']).default('release'),
  defaultWarnings: z.enum(['none', 'default', 'more', 'all']).default('default'),
  cacheEnabled: z.boolean().default(true),
  cacheDir: z.string().default('.board/cache'),
  parallelJobs: z.number().int().positive().default(4),
});

export type CompilerConfig = z.infer<typeof CompilerConfigSchema>;

/**
 * Uploader configuration schema
 */
export const UploaderConfigSchema = z.object({
  verifyAfterUpload: z.boolean().default(true),
  defaultBaudRate: z.number().int().positive().default(115200),
  eraseBeforeUpload: z.boolean().default(false),
  resetMethod: z.enum(['dtr', 'rts', 'none']).default('dtr'),
});

export type UploaderConfig = z.infer<typeof UploaderConfigSchema>;

/**
 * Debugger configuration schema
 */
export const DebuggerConfigSchema = z.object({
  enableSerialMonitor: z.boolean().default(true),
  logDir: z.string().default('.board/logs'),
  maxLogFiles: z.number().int().positive().default(10),
  maxLogSize: z.number().int().positive().default(10),
  crashDetectionEnabled: z.boolean().default(true),
  bootLoopDetectionEnabled: z.boolean().default(true),
});

export type DebuggerConfig = z.infer<typeof DebuggerConfigSchema>;

/**
 * Fix strategy schema
 */
export const FixStrategySchema = z.object({
  name: z.string(),
  priority: z.number().int(),
  enabled: z.boolean().default(true),
  errorPatterns: z.array(z.string()),
  fixFunction: z.string(),
});

export type FixStrategy = z.infer<typeof FixStrategySchema>;

/**
 * Auto-fix configuration schema
 */
export const AutoFixConfigSchema = z.object({
  maxAttempts: z.number().int().positive().max(10).default(5),
  enabled: z.boolean().default(true),
  backupOriginal: z.boolean().default(true),
  strategies: z.array(z.lazy(() => FixStrategySchema)).default([]),
  timeout: z.number().int().positive().default(300),
});

export type AutoFixConfig = z.infer<typeof AutoFixConfigSchema>;

/**
 * Library configuration schema
 */
export const LibraryConfigSchema = z.object({
  autoInstall: z.boolean().default(true),
  searchPaths: z.array(z.string()).default([]),
  preferredSources: z.array(z.enum(['arduino', 'platformio', 'github'])).default(['arduino', 'platformio', 'github']),
  versionPolicy: z.enum(['latest', 'pinned', 'compatible']).default('compatible'),
});

export type LibraryConfig = z.infer<typeof LibraryConfigSchema>;

/**
 * Claude Code integration config schema
 */
export const ClaudeCodeIntegrationConfigSchema = z.object({
  enabled: z.boolean().default(true),
  configPath: z.string().optional(),
  mcpServerName: z.string().default('board-plugin'),
  autoRegister: z.boolean().default(true),
});

export type ClaudeCodeIntegrationConfig = z.infer<typeof ClaudeCodeIntegrationConfigSchema>;

/**
 * OpenCode integration config schema
 */
export const OpenCodeIntegrationConfigSchema = z.object({
  enabled: z.boolean().default(true),
  configPath: z.string().optional(),
  mcpServerName: z.string().default('board-plugin'),
  autoRegister: z.boolean().default(true),
});

export type OpenCodeIntegrationConfig = z.infer<typeof OpenCodeIntegrationConfigSchema>;

/**
 * Integrations configuration schema
 */
export const IntegrationsConfigSchema = z.object({
  claudeCode: z.lazy(() => ClaudeCodeIntegrationConfigSchema),
  opencode: z.lazy(() => OpenCodeIntegrationConfigSchema),
});

export type IntegrationsConfig = z.infer<typeof IntegrationsConfigSchema>;

/**
 * Logging configuration schema
 */
export const LoggingConfigSchema = z.object({
  level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  console: z.boolean().default(true),
  file: z.boolean().default(true),
  filePath: z.string().default('.board/logs/board-plugin.log'),
  maxFiles: z.number().int().positive().default(10),
  maxSize: z.number().int().positive().default(10),
});

export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;

/**
 * Base configuration schema - uses lazy to avoid circular references
 */
export const BaseConfigSchema = z.object({
  version: z.number().int().positive().default(CONFIG_SCHEMA_VERSION),
  arduino: z.lazy(() => ArduinoConfigSchema),
  esp: z.lazy(() => EspConfigSchema),
  platformio: z.lazy(() => PlatformIOConfigSchema),
  serial: z.lazy(() => SerialConfigSchema),
  compiler: z.lazy(() => CompilerConfigSchema),
  uploader: z.lazy(() => UploaderConfigSchema),
  debugger: z.lazy(() => DebuggerConfigSchema),
  autofix: z.lazy(() => AutoFixConfigSchema),
  libraries: z.lazy(() => LibraryConfigSchema),
  integrations: z.lazy(() => IntegrationsConfigSchema),
  logging: z.lazy(() => LoggingConfigSchema),
});

export type BoardPluginConfig = z.infer<typeof BaseConfigSchema>;

/**
 * Configuration source
 */
export interface ConfigSource {
  path: string;
  priority: number;
  format: 'json' | 'yaml' | 'yml';
}

/**
 * Configuration load result
 */
export interface ConfigLoadResult {
  config: BoardPluginConfig;
  sources: ConfigSource[];
  warnings: string[];
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: z.ZodIssue[];
  warnings: string[];
}