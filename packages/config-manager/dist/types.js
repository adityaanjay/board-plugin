"use strict";
/**
 * Configuration Manager type definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseConfigSchema = exports.LoggingConfigSchema = exports.IntegrationsConfigSchema = exports.OpenCodeIntegrationConfigSchema = exports.ClaudeCodeIntegrationConfigSchema = exports.LibraryConfigSchema = exports.AutoFixConfigSchema = exports.FixStrategySchema = exports.DebuggerConfigSchema = exports.UploaderConfigSchema = exports.CompilerConfigSchema = exports.SerialConfigSchema = exports.PlatformIOConfigSchema = exports.EspConfigSchema = exports.ArduinoConfigSchema = exports.CONFIG_SCHEMA_VERSION = void 0;
const zod_1 = require("zod");
/**
 * Configuration schema version
 */
exports.CONFIG_SCHEMA_VERSION = 1;
/**
 * Arduino configuration schema
 */
exports.ArduinoConfigSchema = zod_1.z.object({
    cliPath: zod_1.z.string().optional(),
    autoInstall: zod_1.z.boolean().default(true),
    boardManagerUrls: zod_1.z.array(zod_1.z.string().url()).default([
        'https://downloads.arduino.cc/packages/package_index.json',
        'https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json',
    ]),
    defaultFqbn: zod_1.z.string().default('arduino:avr:uno'),
    sketchbookPath: zod_1.z.string().optional(),
    libraryPaths: zod_1.z.array(zod_1.z.string()).default([]),
});
/**
 * ESP configuration schema
 */
exports.EspConfigSchema = zod_1.z.object({
    esptoolPath: zod_1.z.string().optional(),
    espressifToolPath: zod_1.z.string().optional(),
    autoInstall: zod_1.z.boolean().default(true),
    defaultBaudRate: zod_1.z.number().int().positive().default(921600),
    flashMode: zod_1.z.enum(['dio', 'qio', 'dout', 'qout']).default('dio'),
    flashFreq: zod_1.z.enum(['40m', '26m', '20m', '80m']).default('40m'),
    flashSize: zod_1.z.enum(['1MB', '2MB', '4MB', '8MB', '16MB']).default('4MB'),
});
/**
 * PlatformIO configuration schema
 */
exports.PlatformIOConfigSchema = zod_1.z.object({
    path: zod_1.z.string().optional(),
    version: zod_1.z.string().optional(),
    homeDir: zod_1.z.string().optional(),
    platformsDir: zod_1.z.string().optional(),
    packagesDir: zod_1.z.string().optional(),
});
/**
 * Serial configuration schema
 */
exports.SerialConfigSchema = zod_1.z.object({
    defaultBaudRate: zod_1.z.number().int().positive().default(115200),
    defaultTimeout: zod_1.z.number().int().positive().default(5000),
    maxBufferSize: zod_1.z.number().int().positive().default(65536),
    reconnectAttempts: zod_1.z.number().int().nonnegative().default(3),
    reconnectDelay: zod_1.z.number().int().positive().default(1000),
});
/**
 * Compiler configuration schema
 */
exports.CompilerConfigSchema = zod_1.z.object({
    defaultOptimization: zod_1.z.enum(['debug', 'release', 'size', 'speed']).default('release'),
    defaultWarnings: zod_1.z.enum(['none', 'default', 'more', 'all']).default('default'),
    cacheEnabled: zod_1.z.boolean().default(true),
    cacheDir: zod_1.z.string().default('.board/cache'),
    parallelJobs: zod_1.z.number().int().positive().default(4),
});
/**
 * Uploader configuration schema
 */
exports.UploaderConfigSchema = zod_1.z.object({
    verifyAfterUpload: zod_1.z.boolean().default(true),
    defaultBaudRate: zod_1.z.number().int().positive().default(115200),
    eraseBeforeUpload: zod_1.z.boolean().default(false),
    resetMethod: zod_1.z.enum(['dtr', 'rts', 'none']).default('dtr'),
});
/**
 * Debugger configuration schema
 */
exports.DebuggerConfigSchema = zod_1.z.object({
    enableSerialMonitor: zod_1.z.boolean().default(true),
    logDir: zod_1.z.string().default('.board/logs'),
    maxLogFiles: zod_1.z.number().int().positive().default(10),
    maxLogSize: zod_1.z.number().int().positive().default(10),
    crashDetectionEnabled: zod_1.z.boolean().default(true),
    bootLoopDetectionEnabled: zod_1.z.boolean().default(true),
});
/**
 * Fix strategy schema
 */
exports.FixStrategySchema = zod_1.z.object({
    name: zod_1.z.string(),
    priority: zod_1.z.number().int(),
    enabled: zod_1.z.boolean().default(true),
    errorPatterns: zod_1.z.array(zod_1.z.string()),
    fixFunction: zod_1.z.string(),
});
/**
 * Auto-fix configuration schema
 */
exports.AutoFixConfigSchema = zod_1.z.object({
    maxAttempts: zod_1.z.number().int().positive().max(10).default(5),
    enabled: zod_1.z.boolean().default(true),
    backupOriginal: zod_1.z.boolean().default(true),
    strategies: zod_1.z.array(zod_1.z.lazy(() => exports.FixStrategySchema)).default([]),
    timeout: zod_1.z.number().int().positive().default(300),
});
/**
 * Library configuration schema
 */
exports.LibraryConfigSchema = zod_1.z.object({
    autoInstall: zod_1.z.boolean().default(true),
    searchPaths: zod_1.z.array(zod_1.z.string()).default([]),
    preferredSources: zod_1.z.array(zod_1.z.enum(['arduino', 'platformio', 'github'])).default(['arduino', 'platformio', 'github']),
    versionPolicy: zod_1.z.enum(['latest', 'pinned', 'compatible']).default('compatible'),
});
/**
 * Claude Code integration config schema
 */
exports.ClaudeCodeIntegrationConfigSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().default(true),
    configPath: zod_1.z.string().optional(),
    mcpServerName: zod_1.z.string().default('board-plugin'),
    autoRegister: zod_1.z.boolean().default(true),
});
/**
 * OpenCode integration config schema
 */
exports.OpenCodeIntegrationConfigSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().default(true),
    configPath: zod_1.z.string().optional(),
    mcpServerName: zod_1.z.string().default('board-plugin'),
    autoRegister: zod_1.z.boolean().default(true),
});
/**
 * Integrations configuration schema
 */
exports.IntegrationsConfigSchema = zod_1.z.object({
    claudeCode: zod_1.z.lazy(() => exports.ClaudeCodeIntegrationConfigSchema),
    opencode: zod_1.z.lazy(() => exports.OpenCodeIntegrationConfigSchema),
});
/**
 * Logging configuration schema
 */
exports.LoggingConfigSchema = zod_1.z.object({
    level: zod_1.z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
    console: zod_1.z.boolean().default(true),
    file: zod_1.z.boolean().default(true),
    filePath: zod_1.z.string().default('.board/logs/board-plugin.log'),
    maxFiles: zod_1.z.number().int().positive().default(10),
    maxSize: zod_1.z.number().int().positive().default(10),
});
/**
 * Base configuration schema - uses lazy to avoid circular references
 */
exports.BaseConfigSchema = zod_1.z.object({
    version: zod_1.z.number().int().positive().default(exports.CONFIG_SCHEMA_VERSION),
    arduino: zod_1.z.lazy(() => exports.ArduinoConfigSchema),
    esp: zod_1.z.lazy(() => exports.EspConfigSchema),
    platformio: zod_1.z.lazy(() => exports.PlatformIOConfigSchema),
    serial: zod_1.z.lazy(() => exports.SerialConfigSchema),
    compiler: zod_1.z.lazy(() => exports.CompilerConfigSchema),
    uploader: zod_1.z.lazy(() => exports.UploaderConfigSchema),
    debugger: zod_1.z.lazy(() => exports.DebuggerConfigSchema),
    autofix: zod_1.z.lazy(() => exports.AutoFixConfigSchema),
    libraries: zod_1.z.lazy(() => exports.LibraryConfigSchema),
    integrations: zod_1.z.lazy(() => exports.IntegrationsConfigSchema),
    logging: zod_1.z.lazy(() => exports.LoggingConfigSchema),
});
//# sourceMappingURL=types.js.map