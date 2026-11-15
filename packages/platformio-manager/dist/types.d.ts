/**
 * PlatformIO Manager type definitions
 */
/**
 * PlatformIO configuration
 */
export interface PlatformIOConfig {
    /** Path to platformio executable */
    pioPath?: string;
    /** Default environment */
    defaultEnv: string;
    /** Auto-install PlatformIO if not found */
    autoInstall: boolean;
    /** Verbose output */
    verbose: boolean;
}
/**
 * Build options
 */
export interface BuildOptions {
    /** Environment to build for */
    environment?: string;
    /** Verbose output */
    verbose?: boolean;
    /** Clean build */
    clean?: boolean;
    /** Upload after build */
    upload?: boolean;
    /** Upload port */
    uploadPort?: string;
}
/**
 * Upload options
 */
export interface UploadOptions {
    /** Environment to upload to */
    environment?: string;
    /** Upload port */
    port?: string;
    /** Verbose output */
    verbose?: boolean;
}
/**
 * Build result
 */
export interface BuildResult {
    success: boolean;
    projectPath: string;
    environment: string;
    output: string;
    error: string | undefined;
    duration: number;
    firmwarePath: string | undefined;
}
/**
 * Upload result
 */
export interface UploadResult {
    success: boolean;
    projectPath: string;
    environment: string;
    port: string;
    output: string;
    error: string | undefined;
    duration: number;
}
/**
 * PlatformIO platform info
 */
export interface PlatformIOPlatform {
    name: string;
    version: string;
    description: string;
    frameworks: string[];
    boards: PlatformIOBoard[];
}
/**
 * PlatformIO board info
 */
export interface PlatformIOBoard {
    id: string;
    name: string;
    platform: string;
    mcu: string;
    frequency: string;
    flash: string;
    ram: string;
    framework: string[];
    debug: PlatformIODebug;
}
/**
 * PlatformIO debug info
 */
export interface PlatformIODebug {
    default: string;
    onchip: string[];
    external: string[];
    jlink_device?: string;
    openocd_target?: string;
    svd_path?: string;
}
/**
 * PlatformIO environment info
 */
export interface PlatformIOEnvironment {
    name: string;
    platform: string;
    board: string;
    framework: string;
    buildFlags: string[];
    uploadProtocol: string;
    uploadPort: string;
    monitorPort: string;
    monitorBaud: number;
}
/**
 * PlatformIO manager events
 */
export interface PlatformIOManagerEvents {
    'build:start': (projectPath: string, environment: string) => void;
    'build:complete': (result: BuildResult) => void;
    'build:error': (projectPath: string, environment: string, error: Error) => void;
    'upload:start': (projectPath: string, environment: string, port: string) => void;
    'upload:complete': (result: UploadResult) => void;
    'upload:error': (projectPath: string, environment: string, port: string, error: Error) => void;
    'platform:installed': (platform: string, version: string) => void;
    'board:detected': (board: PlatformIOBoard) => void;
}
/**
 * PlatformIO manager options
 */
export interface PlatformIOManagerOptions {
    config?: Partial<PlatformIOConfig>;
    logger?: any;
}
/**
 * Default PlatformIO configuration
 */
export declare const DEFAULT_PLATFORMIO_CONFIG: PlatformIOConfig;
//# sourceMappingURL=types.d.ts.map