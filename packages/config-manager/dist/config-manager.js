"use strict";
/**
 * Configuration Manager
 * Handles loading, validation, migration, and type-safe access to configuration
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = exports.DEFAULT_CONFIG = void 0;
exports.createConfigManager = createConfigManager;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const os_1 = require("os");
const yaml = __importStar(require("yaml"));
const utils_js_1 = require("./utils.js");
const types_js_1 = require("./types.js");
/**
 * Default configuration
 */
exports.DEFAULT_CONFIG = {
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
const CONFIG_PATHS = [
    // Project-local config
    { path: 'board.config.json', priority: 100, format: 'json' },
    { path: 'board.config.yaml', priority: 99, format: 'yaml' },
    { path: 'board.config.yml', priority: 98, format: 'yaml' },
    { path: '.board/config.json', priority: 97, format: 'json' },
    { path: '.board/config.yaml', priority: 96, format: 'yaml' },
    { path: '.board/config.yml', priority: 95, format: 'yaml' },
    // User home config
    { path: (0, path_1.join)((0, os_1.homedir)(), '.board', 'config.json'), priority: 50, format: 'json' },
    { path: (0, path_1.join)((0, os_1.homedir)(), '.board', 'config.yaml'), priority: 49, format: 'yaml' },
    { path: (0, path_1.join)((0, os_1.homedir)(), '.board', 'config.yml'), priority: 48, format: 'yaml' },
    // System config
    { path: '/etc/board/config.json', priority: 10, format: 'json' },
    { path: '/etc/board/config.yaml', priority: 9, format: 'yaml' },
];
/**
 * Configuration Manager class
 */
class ConfigManager {
    config = exports.DEFAULT_CONFIG;
    sources = [];
    validated = false;
    /**
     * Get the current configuration
     */
    getConfig() {
        return this.config;
    }
    /**
     * Get configuration sources
     */
    getSources() {
        return [...this.sources];
    }
    /**
     * Load configuration from all sources
     */
    async load(customPaths) {
        const paths = customPaths || CONFIG_PATHS;
        const loadedConfigs = [];
        const sources = [];
        const warnings = [];
        // Load from each path in priority order
        for (const source of paths) {
            try {
                await (0, promises_1.access)(source.path, promises_1.constants.R_OK);
                const content = await (0, promises_1.readFile)(source.path, 'utf-8');
                let parsed;
                if (source.format === 'json') {
                    parsed = JSON.parse(content);
                }
                else {
                    parsed = yaml.parse(content);
                }
                loadedConfigs.push(parsed);
                sources.push(source);
            }
            catch (error) {
                // File doesn't exist or can't be read - skip silently
                if (error.code !== 'ENOENT') {
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
        let merged = exports.DEFAULT_CONFIG;
        for (const cfg of loadedConfigs) {
            merged = (0, utils_js_1.deepmerge)(merged, cfg);
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
    loadFromEnvironment() {
        const envConfig = {};
        // Map environment variables to config paths
        const envMappings = {
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
    parseEnvValue(value) {
        // Try to parse as JSON first
        try {
            return JSON.parse(value);
        }
        catch {
            // Return as string
            return value;
        }
    }
    /**
     * Set nested value in object using dot notation
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i]; // i is guaranteed to be valid index by loop condition
            if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
                current[key] = {};
            }
            current = current[key];
        }
        const lastKey = keys[keys.length - 1]; // length >= 1 guaranteed
        current[lastKey] = value;
    }
    /**
     * Validate configuration against schema
     */
    validate(config) {
        const result = types_js_1.BaseConfigSchema.safeParse(config);
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
    migrate(config) {
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
    get(path) {
        const keys = path.split('.');
        let current = this.config;
        for (const key of keys) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return undefined;
            }
            current = current[key];
        }
        return current;
    }
    /**
     * Set a configuration value (runtime only, not persisted)
     */
    set(path, value) {
        this.setNestedValue(this.config, path, value);
    }
    /**
     * Save configuration to a file
     */
    async save(path, format = 'json') {
        const content = format === 'json'
            ? JSON.stringify(this.config, null, 2)
            : yaml.stringify(this.config);
        await (0, promises_1.writeFile)(path, content, 'utf-8');
    }
    /**
     * Generate JSON schema for the configuration
     */
    async generateSchema() {
        // Import zod-to-json-schema dynamically to avoid circular dependency
        const { zodToJsonSchema } = await import('zod-to-json-schema');
        return zodToJsonSchema(types_js_1.BaseConfigSchema, { target: 'jsonSchema7' });
    }
    /**
     * Check if configuration has been loaded and validated
     */
    isLoaded() {
        return this.validated;
    }
    /**
     * Reset configuration to defaults
     */
    reset() {
        this.config = exports.DEFAULT_CONFIG;
        this.sources = [];
        this.validated = false;
    }
}
exports.ConfigManager = ConfigManager;
/**
 * Create and load configuration manager
 */
async function createConfigManager(customPaths) {
    const manager = new ConfigManager();
    await manager.load(customPaths);
    return manager;
}
//# sourceMappingURL=config-manager.js.map