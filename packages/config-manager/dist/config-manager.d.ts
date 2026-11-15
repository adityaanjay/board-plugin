/**
 * Configuration Manager
 * Handles loading, validation, migration, and type-safe access to configuration
 */
import { BoardPluginConfig, ConfigLoadResult, ConfigValidationResult, ConfigSource } from './types.js';
/**
 * Default configuration
 */
export declare const DEFAULT_CONFIG: BoardPluginConfig;
/**
 * Configuration Manager class
 */
export declare class ConfigManager {
    private config;
    private sources;
    private validated;
    /**
     * Get the current configuration
     */
    getConfig(): BoardPluginConfig;
    /**
     * Get configuration sources
     */
    getSources(): ConfigSource[];
    /**
     * Load configuration from all sources
     */
    load(customPaths?: ConfigSource[]): Promise<ConfigLoadResult>;
    /**
     * Load configuration from environment variables
     */
    private loadFromEnvironment;
    /**
     * Parse environment variable value
     */
    private parseEnvValue;
    /**
     * Set nested value in object using dot notation
     */
    private setNestedValue;
    /**
     * Validate configuration against schema
     */
    validate(config: Partial<BoardPluginConfig>): ConfigValidationResult;
    /**
     * Migrate configuration to current version
     */
    migrate(config: BoardPluginConfig): BoardPluginConfig;
    /**
     * Get a typed configuration value
     */
    get<T>(path: string): T | undefined;
    /**
     * Set a configuration value (runtime only, not persisted)
     */
    set(path: string, value: unknown): void;
    /**
     * Save configuration to a file
     */
    save(path: string, format?: 'json' | 'yaml'): Promise<void>;
    /**
     * Generate JSON schema for the configuration
     */
    generateSchema(): Promise<object>;
    /**
     * Check if configuration has been loaded and validated
     */
    isLoaded(): boolean;
    /**
     * Reset configuration to defaults
     */
    reset(): void;
}
/**
 * Create and load configuration manager
 */
export declare function createConfigManager(customPaths?: ConfigSource[]): Promise<ConfigManager>;
//# sourceMappingURL=config-manager.d.ts.map