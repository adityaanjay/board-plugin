/**
 * Arduino Manager type definitions
 */

/**
 * Arduino CLI configuration
 */
export interface ArduinoCliConfig {
  /** Path to arduino-cli executable */
  cliPath?: string | undefined;
  /** Additional board manager URLs */
  boardManagerUrls: string[];
  /** Default FQBN */
  defaultFqbn: string;
  /** Library paths */
  libraryPaths: string[];
  /** Auto-install Arduino CLI if not found */
  autoInstall: boolean;
  /** Verbose output */
  verbose: boolean;
}

/**
 * Sketch configuration
 */
export interface SketchConfig {
  /** Path to sketch directory */
  sketchPath: string;
  /** FQBN (Fully Qualified Board Name) */
  fqbn: string;
  /** Build options */
  buildOptions?: BuildOptions | undefined;
  /** Upload options */
  uploadOptions?: UploadOptions | undefined;
}

/**
 * Build options
 */
export interface BuildOptions {
  /** Optimization level: 'debug', 'release', 'size', 'fast' */
  optimization?: 'debug' | 'release' | 'size' | 'fast' | undefined;
  /** Warning level: 'none', 'default', 'more', 'all' */
  warnings?: 'none' | 'default' | 'more' | 'all' | undefined;
  /** Verbose output */
  verbose?: boolean | undefined;
  /** Clean build */
  clean?: boolean | undefined;
  /** Build cache path */
  cachePath?: string | undefined;
  /** Build path */
  buildPath?: string | undefined;
  /** Custom build properties */
  properties?: Record<string, string> | undefined;
}

/**
 * Upload options
 */
export interface UploadOptions {
  /** Upload port */
  port?: string | undefined;
  /** Upload protocol */
  protocol?: string | undefined;
  /** Verify after upload */
  verify?: boolean | undefined;
  /** Baud rate for upload */
  baudRate?: number | undefined;
  /** Reset method */
  resetMethod?: 'dtr' | 'rts' | 'dsr' | 'none' | undefined;
  /** Erase before upload */
  eraseBeforeUpload?: boolean | undefined;
}

/**
 * Compilation result
 */
export interface CompileResult {
  success: boolean;
  sketchPath: string;
  fqbn: string;
  binaryPath: string | undefined;
  buildPath: string | undefined;
  output: string;
  error: string | undefined;
  duration: number;
}

/**
 * Upload result
 */
export interface UploadResult {
  success: boolean;
  port: string;
  fqbn: string;
  output: string;
  error: string | undefined;
  duration: number;
  verified: boolean | undefined;
}

/**
 * Arduino board info from arduino-cli
 */
export interface ArduinoBoardInfo {
  name: string;
  fqbn: string;
  platform: string;
  platformVersion: string;
  core: string;
  coreVersion: string;
  boards: ArduinoBoardInfo[];
}

/**
 * Arduino core info
 */
export interface ArduinoCoreInfo {
  name: string;
  version: string;
  platform: string;
  boards: ArduinoBoardInfo[];
}

/**
 * Arduino manager events
 */
export interface ArduinoManagerEvents {
  'compile:start': (sketchPath: string, fqbn: string) => void;
  'compile:complete': (result: CompileResult) => void;
  'compile:error': (sketchPath: string, fqbn: string, error: Error) => void;
  'upload:start': (port: string, fqbn: string) => void;
  'upload:complete': (result: UploadResult) => void;
  'upload:error': (port: string, fqbn: string, error: Error) => void;
  'board:detected': (board: ArduinoBoardInfo) => void;
  'core:installed': (core: string, version: string) => void;
}

/**
 * Arduino manager options
 */
export interface ArduinoManagerOptions {
  config?: Partial<ArduinoCliConfig> | undefined;
  logger?: any;
}

/**
 * Default Arduino CLI configuration
 */
export const DEFAULT_ARDUINO_CLI_CONFIG: ArduinoCliConfig = {
  boardManagerUrls: [
    'https://downloads.arduino.cc/packages/package_index.json',
    'https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json',
  ],
  defaultFqbn: 'arduino:avr:uno',
  libraryPaths: [],
  autoInstall: true,
  verbose: false,
};