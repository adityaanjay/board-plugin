/**
 * Configuration Manager type definitions
 */
import { z } from 'zod';
/**
 * Configuration schema version
 */
export declare const CONFIG_SCHEMA_VERSION = 1;
/**
 * Arduino configuration schema
 */
export declare const ArduinoConfigSchema: z.ZodObject<{
    cliPath: z.ZodOptional<z.ZodString>;
    autoInstall: z.ZodDefault<z.ZodBoolean>;
    boardManagerUrls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    defaultFqbn: z.ZodDefault<z.ZodString>;
    sketchbookPath: z.ZodOptional<z.ZodString>;
    libraryPaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    autoInstall: boolean;
    boardManagerUrls: string[];
    defaultFqbn: string;
    libraryPaths: string[];
    cliPath?: string | undefined;
    sketchbookPath?: string | undefined;
}, {
    cliPath?: string | undefined;
    autoInstall?: boolean | undefined;
    boardManagerUrls?: string[] | undefined;
    defaultFqbn?: string | undefined;
    sketchbookPath?: string | undefined;
    libraryPaths?: string[] | undefined;
}>;
export type ArduinoConfig = z.infer<typeof ArduinoConfigSchema>;
/**
 * ESP configuration schema
 */
export declare const EspConfigSchema: z.ZodObject<{
    esptoolPath: z.ZodOptional<z.ZodString>;
    espressifToolPath: z.ZodOptional<z.ZodString>;
    autoInstall: z.ZodDefault<z.ZodBoolean>;
    defaultBaudRate: z.ZodDefault<z.ZodNumber>;
    flashMode: z.ZodDefault<z.ZodEnum<["dio", "qio", "dout", "qout"]>>;
    flashFreq: z.ZodDefault<z.ZodEnum<["40m", "26m", "20m", "80m"]>>;
    flashSize: z.ZodDefault<z.ZodEnum<["1MB", "2MB", "4MB", "8MB", "16MB"]>>;
}, "strip", z.ZodTypeAny, {
    autoInstall: boolean;
    defaultBaudRate: number;
    flashMode: "dio" | "qio" | "dout" | "qout";
    flashFreq: "40m" | "26m" | "20m" | "80m";
    flashSize: "1MB" | "2MB" | "4MB" | "8MB" | "16MB";
    esptoolPath?: string | undefined;
    espressifToolPath?: string | undefined;
}, {
    autoInstall?: boolean | undefined;
    esptoolPath?: string | undefined;
    espressifToolPath?: string | undefined;
    defaultBaudRate?: number | undefined;
    flashMode?: "dio" | "qio" | "dout" | "qout" | undefined;
    flashFreq?: "40m" | "26m" | "20m" | "80m" | undefined;
    flashSize?: "1MB" | "2MB" | "4MB" | "8MB" | "16MB" | undefined;
}>;
export type EspConfig = z.infer<typeof EspConfigSchema>;
/**
 * PlatformIO configuration schema
 */
export declare const PlatformIOConfigSchema: z.ZodObject<{
    path: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    homeDir: z.ZodOptional<z.ZodString>;
    platformsDir: z.ZodOptional<z.ZodString>;
    packagesDir: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path?: string | undefined;
    version?: string | undefined;
    homeDir?: string | undefined;
    platformsDir?: string | undefined;
    packagesDir?: string | undefined;
}, {
    path?: string | undefined;
    version?: string | undefined;
    homeDir?: string | undefined;
    platformsDir?: string | undefined;
    packagesDir?: string | undefined;
}>;
export type PlatformIOConfig = z.infer<typeof PlatformIOConfigSchema>;
/**
 * Serial configuration schema
 */
export declare const SerialConfigSchema: z.ZodObject<{
    defaultBaudRate: z.ZodDefault<z.ZodNumber>;
    defaultTimeout: z.ZodDefault<z.ZodNumber>;
    maxBufferSize: z.ZodDefault<z.ZodNumber>;
    reconnectAttempts: z.ZodDefault<z.ZodNumber>;
    reconnectDelay: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    defaultBaudRate: number;
    defaultTimeout: number;
    maxBufferSize: number;
    reconnectAttempts: number;
    reconnectDelay: number;
}, {
    defaultBaudRate?: number | undefined;
    defaultTimeout?: number | undefined;
    maxBufferSize?: number | undefined;
    reconnectAttempts?: number | undefined;
    reconnectDelay?: number | undefined;
}>;
export type SerialConfig = z.infer<typeof SerialConfigSchema>;
/**
 * Compiler configuration schema
 */
export declare const CompilerConfigSchema: z.ZodObject<{
    defaultOptimization: z.ZodDefault<z.ZodEnum<["debug", "release", "size", "speed"]>>;
    defaultWarnings: z.ZodDefault<z.ZodEnum<["none", "default", "more", "all"]>>;
    cacheEnabled: z.ZodDefault<z.ZodBoolean>;
    cacheDir: z.ZodDefault<z.ZodString>;
    parallelJobs: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    defaultOptimization: "debug" | "release" | "size" | "speed";
    defaultWarnings: "none" | "default" | "more" | "all";
    cacheEnabled: boolean;
    cacheDir: string;
    parallelJobs: number;
}, {
    defaultOptimization?: "debug" | "release" | "size" | "speed" | undefined;
    defaultWarnings?: "none" | "default" | "more" | "all" | undefined;
    cacheEnabled?: boolean | undefined;
    cacheDir?: string | undefined;
    parallelJobs?: number | undefined;
}>;
export type CompilerConfig = z.infer<typeof CompilerConfigSchema>;
/**
 * Uploader configuration schema
 */
export declare const UploaderConfigSchema: z.ZodObject<{
    verifyAfterUpload: z.ZodDefault<z.ZodBoolean>;
    defaultBaudRate: z.ZodDefault<z.ZodNumber>;
    eraseBeforeUpload: z.ZodDefault<z.ZodBoolean>;
    resetMethod: z.ZodDefault<z.ZodEnum<["dtr", "rts", "none"]>>;
}, "strip", z.ZodTypeAny, {
    defaultBaudRate: number;
    verifyAfterUpload: boolean;
    eraseBeforeUpload: boolean;
    resetMethod: "none" | "dtr" | "rts";
}, {
    defaultBaudRate?: number | undefined;
    verifyAfterUpload?: boolean | undefined;
    eraseBeforeUpload?: boolean | undefined;
    resetMethod?: "none" | "dtr" | "rts" | undefined;
}>;
export type UploaderConfig = z.infer<typeof UploaderConfigSchema>;
/**
 * Debugger configuration schema
 */
export declare const DebuggerConfigSchema: z.ZodObject<{
    enableSerialMonitor: z.ZodDefault<z.ZodBoolean>;
    logDir: z.ZodDefault<z.ZodString>;
    maxLogFiles: z.ZodDefault<z.ZodNumber>;
    maxLogSize: z.ZodDefault<z.ZodNumber>;
    crashDetectionEnabled: z.ZodDefault<z.ZodBoolean>;
    bootLoopDetectionEnabled: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enableSerialMonitor: boolean;
    logDir: string;
    maxLogFiles: number;
    maxLogSize: number;
    crashDetectionEnabled: boolean;
    bootLoopDetectionEnabled: boolean;
}, {
    enableSerialMonitor?: boolean | undefined;
    logDir?: string | undefined;
    maxLogFiles?: number | undefined;
    maxLogSize?: number | undefined;
    crashDetectionEnabled?: boolean | undefined;
    bootLoopDetectionEnabled?: boolean | undefined;
}>;
export type DebuggerConfig = z.infer<typeof DebuggerConfigSchema>;
/**
 * Fix strategy schema
 */
export declare const FixStrategySchema: z.ZodObject<{
    name: z.ZodString;
    priority: z.ZodNumber;
    enabled: z.ZodDefault<z.ZodBoolean>;
    errorPatterns: z.ZodArray<z.ZodString, "many">;
    fixFunction: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    priority: number;
    enabled: boolean;
    errorPatterns: string[];
    fixFunction: string;
}, {
    name: string;
    priority: number;
    errorPatterns: string[];
    fixFunction: string;
    enabled?: boolean | undefined;
}>;
export type FixStrategy = z.infer<typeof FixStrategySchema>;
/**
 * Auto-fix configuration schema
 */
export declare const AutoFixConfigSchema: z.ZodObject<{
    maxAttempts: z.ZodDefault<z.ZodNumber>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    backupOriginal: z.ZodDefault<z.ZodBoolean>;
    strategies: z.ZodDefault<z.ZodArray<z.ZodLazy<z.ZodObject<{
        name: z.ZodString;
        priority: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        errorPatterns: z.ZodArray<z.ZodString, "many">;
        fixFunction: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        priority: number;
        enabled: boolean;
        errorPatterns: string[];
        fixFunction: string;
    }, {
        name: string;
        priority: number;
        errorPatterns: string[];
        fixFunction: string;
        enabled?: boolean | undefined;
    }>>, "many">>;
    timeout: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    maxAttempts: number;
    backupOriginal: boolean;
    strategies: {
        name: string;
        priority: number;
        enabled: boolean;
        errorPatterns: string[];
        fixFunction: string;
    }[];
    timeout: number;
}, {
    enabled?: boolean | undefined;
    maxAttempts?: number | undefined;
    backupOriginal?: boolean | undefined;
    strategies?: {
        name: string;
        priority: number;
        errorPatterns: string[];
        fixFunction: string;
        enabled?: boolean | undefined;
    }[] | undefined;
    timeout?: number | undefined;
}>;
export type AutoFixConfig = z.infer<typeof AutoFixConfigSchema>;
/**
 * Library configuration schema
 */
export declare const LibraryConfigSchema: z.ZodObject<{
    autoInstall: z.ZodDefault<z.ZodBoolean>;
    searchPaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    preferredSources: z.ZodDefault<z.ZodArray<z.ZodEnum<["arduino", "platformio", "github"]>, "many">>;
    versionPolicy: z.ZodDefault<z.ZodEnum<["latest", "pinned", "compatible"]>>;
}, "strip", z.ZodTypeAny, {
    autoInstall: boolean;
    searchPaths: string[];
    preferredSources: ("arduino" | "platformio" | "github")[];
    versionPolicy: "latest" | "pinned" | "compatible";
}, {
    autoInstall?: boolean | undefined;
    searchPaths?: string[] | undefined;
    preferredSources?: ("arduino" | "platformio" | "github")[] | undefined;
    versionPolicy?: "latest" | "pinned" | "compatible" | undefined;
}>;
export type LibraryConfig = z.infer<typeof LibraryConfigSchema>;
/**
 * Claude Code integration config schema
 */
export declare const ClaudeCodeIntegrationConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    configPath: z.ZodOptional<z.ZodString>;
    mcpServerName: z.ZodDefault<z.ZodString>;
    autoRegister: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    mcpServerName: string;
    autoRegister: boolean;
    configPath?: string | undefined;
}, {
    enabled?: boolean | undefined;
    configPath?: string | undefined;
    mcpServerName?: string | undefined;
    autoRegister?: boolean | undefined;
}>;
export type ClaudeCodeIntegrationConfig = z.infer<typeof ClaudeCodeIntegrationConfigSchema>;
/**
 * OpenCode integration config schema
 */
export declare const OpenCodeIntegrationConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    configPath: z.ZodOptional<z.ZodString>;
    mcpServerName: z.ZodDefault<z.ZodString>;
    autoRegister: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    mcpServerName: string;
    autoRegister: boolean;
    configPath?: string | undefined;
}, {
    enabled?: boolean | undefined;
    configPath?: string | undefined;
    mcpServerName?: string | undefined;
    autoRegister?: boolean | undefined;
}>;
export type OpenCodeIntegrationConfig = z.infer<typeof OpenCodeIntegrationConfigSchema>;
/**
 * Integrations configuration schema
 */
export declare const IntegrationsConfigSchema: z.ZodObject<{
    claudeCode: z.ZodLazy<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        configPath: z.ZodOptional<z.ZodString>;
        mcpServerName: z.ZodDefault<z.ZodString>;
        autoRegister: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        mcpServerName: string;
        autoRegister: boolean;
        configPath?: string | undefined;
    }, {
        enabled?: boolean | undefined;
        configPath?: string | undefined;
        mcpServerName?: string | undefined;
        autoRegister?: boolean | undefined;
    }>>;
    opencode: z.ZodLazy<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        configPath: z.ZodOptional<z.ZodString>;
        mcpServerName: z.ZodDefault<z.ZodString>;
        autoRegister: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        mcpServerName: string;
        autoRegister: boolean;
        configPath?: string | undefined;
    }, {
        enabled?: boolean | undefined;
        configPath?: string | undefined;
        mcpServerName?: string | undefined;
        autoRegister?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    claudeCode: {
        enabled: boolean;
        mcpServerName: string;
        autoRegister: boolean;
        configPath?: string | undefined;
    };
    opencode: {
        enabled: boolean;
        mcpServerName: string;
        autoRegister: boolean;
        configPath?: string | undefined;
    };
}, {
    claudeCode: {
        enabled?: boolean | undefined;
        configPath?: string | undefined;
        mcpServerName?: string | undefined;
        autoRegister?: boolean | undefined;
    };
    opencode: {
        enabled?: boolean | undefined;
        configPath?: string | undefined;
        mcpServerName?: string | undefined;
        autoRegister?: boolean | undefined;
    };
}>;
export type IntegrationsConfig = z.infer<typeof IntegrationsConfigSchema>;
/**
 * Logging configuration schema
 */
export declare const LoggingConfigSchema: z.ZodObject<{
    level: z.ZodDefault<z.ZodEnum<["trace", "debug", "info", "warn", "error", "fatal"]>>;
    console: z.ZodDefault<z.ZodBoolean>;
    file: z.ZodDefault<z.ZodBoolean>;
    filePath: z.ZodDefault<z.ZodString>;
    maxFiles: z.ZodDefault<z.ZodNumber>;
    maxSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    level: "debug" | "trace" | "info" | "warn" | "error" | "fatal";
    console: boolean;
    file: boolean;
    filePath: string;
    maxFiles: number;
    maxSize: number;
}, {
    level?: "debug" | "trace" | "info" | "warn" | "error" | "fatal" | undefined;
    console?: boolean | undefined;
    file?: boolean | undefined;
    filePath?: string | undefined;
    maxFiles?: number | undefined;
    maxSize?: number | undefined;
}>;
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;
/**
 * Base configuration schema - uses lazy to avoid circular references
 */
export declare const BaseConfigSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodNumber>;
    arduino: z.ZodLazy<z.ZodObject<{
        cliPath: z.ZodOptional<z.ZodString>;
        autoInstall: z.ZodDefault<z.ZodBoolean>;
        boardManagerUrls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        defaultFqbn: z.ZodDefault<z.ZodString>;
        sketchbookPath: z.ZodOptional<z.ZodString>;
        libraryPaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        autoInstall: boolean;
        boardManagerUrls: string[];
        defaultFqbn: string;
        libraryPaths: string[];
        cliPath?: string | undefined;
        sketchbookPath?: string | undefined;
    }, {
        cliPath?: string | undefined;
        autoInstall?: boolean | undefined;
        boardManagerUrls?: string[] | undefined;
        defaultFqbn?: string | undefined;
        sketchbookPath?: string | undefined;
        libraryPaths?: string[] | undefined;
    }>>;
    esp: z.ZodLazy<z.ZodObject<{
        esptoolPath: z.ZodOptional<z.ZodString>;
        espressifToolPath: z.ZodOptional<z.ZodString>;
        autoInstall: z.ZodDefault<z.ZodBoolean>;
        defaultBaudRate: z.ZodDefault<z.ZodNumber>;
        flashMode: z.ZodDefault<z.ZodEnum<["dio", "qio", "dout", "qout"]>>;
        flashFreq: z.ZodDefault<z.ZodEnum<["40m", "26m", "20m", "80m"]>>;
        flashSize: z.ZodDefault<z.ZodEnum<["1MB", "2MB", "4MB", "8MB", "16MB"]>>;
    }, "strip", z.ZodTypeAny, {
        autoInstall: boolean;
        defaultBaudRate: number;
        flashMode: "dio" | "qio" | "dout" | "qout";
        flashFreq: "40m" | "26m" | "20m" | "80m";
        flashSize: "1MB" | "2MB" | "4MB" | "8MB" | "16MB";
        esptoolPath?: string | undefined;
        espressifToolPath?: string | undefined;
    }, {
        autoInstall?: boolean | undefined;
        esptoolPath?: string | undefined;
        espressifToolPath?: string | undefined;
        defaultBaudRate?: number | undefined;
        flashMode?: "dio" | "qio" | "dout" | "qout" | undefined;
        flashFreq?: "40m" | "26m" | "20m" | "80m" | undefined;
        flashSize?: "1MB" | "2MB" | "4MB" | "8MB" | "16MB" | undefined;
    }>>;
    platformio: z.ZodLazy<z.ZodObject<{
        path: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
        homeDir: z.ZodOptional<z.ZodString>;
        platformsDir: z.ZodOptional<z.ZodString>;
        packagesDir: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path?: string | undefined;
        version?: string | undefined;
        homeDir?: string | undefined;
        platformsDir?: string | undefined;
        packagesDir?: string | undefined;
    }, {
        path?: string | undefined;
        version?: string | undefined;
        homeDir?: string | undefined;
        platformsDir?: string | undefined;
        packagesDir?: string | undefined;
    }>>;
    serial: z.ZodLazy<z.ZodObject<{
        defaultBaudRate: z.ZodDefault<z.ZodNumber>;
        defaultTimeout: z.ZodDefault<z.ZodNumber>;
        maxBufferSize: z.ZodDefault<z.ZodNumber>;
        reconnectAttempts: z.ZodDefault<z.ZodNumber>;
        reconnectDelay: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        defaultBaudRate: number;
        defaultTimeout: number;
        maxBufferSize: number;
        reconnectAttempts: number;
        reconnectDelay: number;
    }, {
        defaultBaudRate?: number | undefined;
        defaultTimeout?: number | undefined;
        maxBufferSize?: number | undefined;
        reconnectAttempts?: number | undefined;
        reconnectDelay?: number | undefined;
    }>>;
    compiler: z.ZodLazy<z.ZodObject<{
        defaultOptimization: z.ZodDefault<z.ZodEnum<["debug", "release", "size", "speed"]>>;
        defaultWarnings: z.ZodDefault<z.ZodEnum<["none", "default", "more", "all"]>>;
        cacheEnabled: z.ZodDefault<z.ZodBoolean>;
        cacheDir: z.ZodDefault<z.ZodString>;
        parallelJobs: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        defaultOptimization: "debug" | "release" | "size" | "speed";
        defaultWarnings: "none" | "default" | "more" | "all";
        cacheEnabled: boolean;
        cacheDir: string;
        parallelJobs: number;
    }, {
        defaultOptimization?: "debug" | "release" | "size" | "speed" | undefined;
        defaultWarnings?: "none" | "default" | "more" | "all" | undefined;
        cacheEnabled?: boolean | undefined;
        cacheDir?: string | undefined;
        parallelJobs?: number | undefined;
    }>>;
    uploader: z.ZodLazy<z.ZodObject<{
        verifyAfterUpload: z.ZodDefault<z.ZodBoolean>;
        defaultBaudRate: z.ZodDefault<z.ZodNumber>;
        eraseBeforeUpload: z.ZodDefault<z.ZodBoolean>;
        resetMethod: z.ZodDefault<z.ZodEnum<["dtr", "rts", "none"]>>;
    }, "strip", z.ZodTypeAny, {
        defaultBaudRate: number;
        verifyAfterUpload: boolean;
        eraseBeforeUpload: boolean;
        resetMethod: "none" | "dtr" | "rts";
    }, {
        defaultBaudRate?: number | undefined;
        verifyAfterUpload?: boolean | undefined;
        eraseBeforeUpload?: boolean | undefined;
        resetMethod?: "none" | "dtr" | "rts" | undefined;
    }>>;
    debugger: z.ZodLazy<z.ZodObject<{
        enableSerialMonitor: z.ZodDefault<z.ZodBoolean>;
        logDir: z.ZodDefault<z.ZodString>;
        maxLogFiles: z.ZodDefault<z.ZodNumber>;
        maxLogSize: z.ZodDefault<z.ZodNumber>;
        crashDetectionEnabled: z.ZodDefault<z.ZodBoolean>;
        bootLoopDetectionEnabled: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enableSerialMonitor: boolean;
        logDir: string;
        maxLogFiles: number;
        maxLogSize: number;
        crashDetectionEnabled: boolean;
        bootLoopDetectionEnabled: boolean;
    }, {
        enableSerialMonitor?: boolean | undefined;
        logDir?: string | undefined;
        maxLogFiles?: number | undefined;
        maxLogSize?: number | undefined;
        crashDetectionEnabled?: boolean | undefined;
        bootLoopDetectionEnabled?: boolean | undefined;
    }>>;
    autofix: z.ZodLazy<z.ZodObject<{
        maxAttempts: z.ZodDefault<z.ZodNumber>;
        enabled: z.ZodDefault<z.ZodBoolean>;
        backupOriginal: z.ZodDefault<z.ZodBoolean>;
        strategies: z.ZodDefault<z.ZodArray<z.ZodLazy<z.ZodObject<{
            name: z.ZodString;
            priority: z.ZodNumber;
            enabled: z.ZodDefault<z.ZodBoolean>;
            errorPatterns: z.ZodArray<z.ZodString, "many">;
            fixFunction: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            priority: number;
            enabled: boolean;
            errorPatterns: string[];
            fixFunction: string;
        }, {
            name: string;
            priority: number;
            errorPatterns: string[];
            fixFunction: string;
            enabled?: boolean | undefined;
        }>>, "many">>;
        timeout: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        maxAttempts: number;
        backupOriginal: boolean;
        strategies: {
            name: string;
            priority: number;
            enabled: boolean;
            errorPatterns: string[];
            fixFunction: string;
        }[];
        timeout: number;
    }, {
        enabled?: boolean | undefined;
        maxAttempts?: number | undefined;
        backupOriginal?: boolean | undefined;
        strategies?: {
            name: string;
            priority: number;
            errorPatterns: string[];
            fixFunction: string;
            enabled?: boolean | undefined;
        }[] | undefined;
        timeout?: number | undefined;
    }>>;
    libraries: z.ZodLazy<z.ZodObject<{
        autoInstall: z.ZodDefault<z.ZodBoolean>;
        searchPaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        preferredSources: z.ZodDefault<z.ZodArray<z.ZodEnum<["arduino", "platformio", "github"]>, "many">>;
        versionPolicy: z.ZodDefault<z.ZodEnum<["latest", "pinned", "compatible"]>>;
    }, "strip", z.ZodTypeAny, {
        autoInstall: boolean;
        searchPaths: string[];
        preferredSources: ("arduino" | "platformio" | "github")[];
        versionPolicy: "latest" | "pinned" | "compatible";
    }, {
        autoInstall?: boolean | undefined;
        searchPaths?: string[] | undefined;
        preferredSources?: ("arduino" | "platformio" | "github")[] | undefined;
        versionPolicy?: "latest" | "pinned" | "compatible" | undefined;
    }>>;
    integrations: z.ZodLazy<z.ZodObject<{
        claudeCode: z.ZodLazy<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            configPath: z.ZodOptional<z.ZodString>;
            mcpServerName: z.ZodDefault<z.ZodString>;
            autoRegister: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            mcpServerName: string;
            autoRegister: boolean;
            configPath?: string | undefined;
        }, {
            enabled?: boolean | undefined;
            configPath?: string | undefined;
            mcpServerName?: string | undefined;
            autoRegister?: boolean | undefined;
        }>>;
        opencode: z.ZodLazy<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            configPath: z.ZodOptional<z.ZodString>;
            mcpServerName: z.ZodDefault<z.ZodString>;
            autoRegister: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            mcpServerName: string;
            autoRegister: boolean;
            configPath?: string | undefined;
        }, {
            enabled?: boolean | undefined;
            configPath?: string | undefined;
            mcpServerName?: string | undefined;
            autoRegister?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        claudeCode: {
            enabled: boolean;
            mcpServerName: string;
            autoRegister: boolean;
            configPath?: string | undefined;
        };
        opencode: {
            enabled: boolean;
            mcpServerName: string;
            autoRegister: boolean;
            configPath?: string | undefined;
        };
    }, {
        claudeCode: {
            enabled?: boolean | undefined;
            configPath?: string | undefined;
            mcpServerName?: string | undefined;
            autoRegister?: boolean | undefined;
        };
        opencode: {
            enabled?: boolean | undefined;
            configPath?: string | undefined;
            mcpServerName?: string | undefined;
            autoRegister?: boolean | undefined;
        };
    }>>;
    logging: z.ZodLazy<z.ZodObject<{
        level: z.ZodDefault<z.ZodEnum<["trace", "debug", "info", "warn", "error", "fatal"]>>;
        console: z.ZodDefault<z.ZodBoolean>;
        file: z.ZodDefault<z.ZodBoolean>;
        filePath: z.ZodDefault<z.ZodString>;
        maxFiles: z.ZodDefault<z.ZodNumber>;
        maxSize: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        level: "debug" | "trace" | "info" | "warn" | "error" | "fatal";
        console: boolean;
        file: boolean;
        filePath: string;
        maxFiles: number;
        maxSize: number;
    }, {
        level?: "debug" | "trace" | "info" | "warn" | "error" | "fatal" | undefined;
        console?: boolean | undefined;
        file?: boolean | undefined;
        filePath?: string | undefined;
        maxFiles?: number | undefined;
        maxSize?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    version: number;
    arduino: {
        autoInstall: boolean;
        boardManagerUrls: string[];
        defaultFqbn: string;
        libraryPaths: string[];
        cliPath?: string | undefined;
        sketchbookPath?: string | undefined;
    };
    platformio: {
        path?: string | undefined;
        version?: string | undefined;
        homeDir?: string | undefined;
        platformsDir?: string | undefined;
        packagesDir?: string | undefined;
    };
    esp: {
        autoInstall: boolean;
        defaultBaudRate: number;
        flashMode: "dio" | "qio" | "dout" | "qout";
        flashFreq: "40m" | "26m" | "20m" | "80m";
        flashSize: "1MB" | "2MB" | "4MB" | "8MB" | "16MB";
        esptoolPath?: string | undefined;
        espressifToolPath?: string | undefined;
    };
    serial: {
        defaultBaudRate: number;
        defaultTimeout: number;
        maxBufferSize: number;
        reconnectAttempts: number;
        reconnectDelay: number;
    };
    compiler: {
        defaultOptimization: "debug" | "release" | "size" | "speed";
        defaultWarnings: "none" | "default" | "more" | "all";
        cacheEnabled: boolean;
        cacheDir: string;
        parallelJobs: number;
    };
    uploader: {
        defaultBaudRate: number;
        verifyAfterUpload: boolean;
        eraseBeforeUpload: boolean;
        resetMethod: "none" | "dtr" | "rts";
    };
    debugger: {
        enableSerialMonitor: boolean;
        logDir: string;
        maxLogFiles: number;
        maxLogSize: number;
        crashDetectionEnabled: boolean;
        bootLoopDetectionEnabled: boolean;
    };
    autofix: {
        enabled: boolean;
        maxAttempts: number;
        backupOriginal: boolean;
        strategies: {
            name: string;
            priority: number;
            enabled: boolean;
            errorPatterns: string[];
            fixFunction: string;
        }[];
        timeout: number;
    };
    libraries: {
        autoInstall: boolean;
        searchPaths: string[];
        preferredSources: ("arduino" | "platformio" | "github")[];
        versionPolicy: "latest" | "pinned" | "compatible";
    };
    integrations: {
        claudeCode: {
            enabled: boolean;
            mcpServerName: string;
            autoRegister: boolean;
            configPath?: string | undefined;
        };
        opencode: {
            enabled: boolean;
            mcpServerName: string;
            autoRegister: boolean;
            configPath?: string | undefined;
        };
    };
    logging: {
        level: "debug" | "trace" | "info" | "warn" | "error" | "fatal";
        console: boolean;
        file: boolean;
        filePath: string;
        maxFiles: number;
        maxSize: number;
    };
}, {
    arduino: {
        cliPath?: string | undefined;
        autoInstall?: boolean | undefined;
        boardManagerUrls?: string[] | undefined;
        defaultFqbn?: string | undefined;
        sketchbookPath?: string | undefined;
        libraryPaths?: string[] | undefined;
    };
    platformio: {
        path?: string | undefined;
        version?: string | undefined;
        homeDir?: string | undefined;
        platformsDir?: string | undefined;
        packagesDir?: string | undefined;
    };
    esp: {
        autoInstall?: boolean | undefined;
        esptoolPath?: string | undefined;
        espressifToolPath?: string | undefined;
        defaultBaudRate?: number | undefined;
        flashMode?: "dio" | "qio" | "dout" | "qout" | undefined;
        flashFreq?: "40m" | "26m" | "20m" | "80m" | undefined;
        flashSize?: "1MB" | "2MB" | "4MB" | "8MB" | "16MB" | undefined;
    };
    serial: {
        defaultBaudRate?: number | undefined;
        defaultTimeout?: number | undefined;
        maxBufferSize?: number | undefined;
        reconnectAttempts?: number | undefined;
        reconnectDelay?: number | undefined;
    };
    compiler: {
        defaultOptimization?: "debug" | "release" | "size" | "speed" | undefined;
        defaultWarnings?: "none" | "default" | "more" | "all" | undefined;
        cacheEnabled?: boolean | undefined;
        cacheDir?: string | undefined;
        parallelJobs?: number | undefined;
    };
    uploader: {
        defaultBaudRate?: number | undefined;
        verifyAfterUpload?: boolean | undefined;
        eraseBeforeUpload?: boolean | undefined;
        resetMethod?: "none" | "dtr" | "rts" | undefined;
    };
    debugger: {
        enableSerialMonitor?: boolean | undefined;
        logDir?: string | undefined;
        maxLogFiles?: number | undefined;
        maxLogSize?: number | undefined;
        crashDetectionEnabled?: boolean | undefined;
        bootLoopDetectionEnabled?: boolean | undefined;
    };
    autofix: {
        enabled?: boolean | undefined;
        maxAttempts?: number | undefined;
        backupOriginal?: boolean | undefined;
        strategies?: {
            name: string;
            priority: number;
            errorPatterns: string[];
            fixFunction: string;
            enabled?: boolean | undefined;
        }[] | undefined;
        timeout?: number | undefined;
    };
    libraries: {
        autoInstall?: boolean | undefined;
        searchPaths?: string[] | undefined;
        preferredSources?: ("arduino" | "platformio" | "github")[] | undefined;
        versionPolicy?: "latest" | "pinned" | "compatible" | undefined;
    };
    integrations: {
        claudeCode: {
            enabled?: boolean | undefined;
            configPath?: string | undefined;
            mcpServerName?: string | undefined;
            autoRegister?: boolean | undefined;
        };
        opencode: {
            enabled?: boolean | undefined;
            configPath?: string | undefined;
            mcpServerName?: string | undefined;
            autoRegister?: boolean | undefined;
        };
    };
    logging: {
        level?: "debug" | "trace" | "info" | "warn" | "error" | "fatal" | undefined;
        console?: boolean | undefined;
        file?: boolean | undefined;
        filePath?: string | undefined;
        maxFiles?: number | undefined;
        maxSize?: number | undefined;
    };
    version?: number | undefined;
}>;
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
//# sourceMappingURL=types.d.ts.map