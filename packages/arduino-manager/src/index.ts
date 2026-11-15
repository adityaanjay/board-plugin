/**
 * Arduino Manager Module
 * Provides Arduino CLI integration for compiling and uploading sketches
 */

export { ArduinoManager, createArduinoManager } from './arduino-manager.js';
export { DEFAULT_ARDUINO_CLI_CONFIG } from './types.js';
export type {
  ArduinoCliConfig,
  SketchConfig,
  BuildOptions,
  UploadOptions,
  CompileResult,
  UploadResult,
  ArduinoBoardInfo,
  ArduinoCoreInfo,
  ArduinoManagerEvents,
  ArduinoManagerOptions,
} from './types.js';