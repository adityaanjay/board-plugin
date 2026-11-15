/**
 * Core type definitions for Board Plugin
 * Central type definitions used across all modules
 */

import { SerialPort } from 'serialport';

/**
 * Supported board types
 */
export enum BoardType {
  // Arduino boards
  ARDUINO_UNO = 'arduino_uno',
  ARDUINO_UNO_R4 = 'arduino_uno_r4',
  ARDUINO_MEGA_2560 = 'arduino_mega_2560',
  ARDUINO_NANO = 'arduino_nano',
  ARDUINO_LEONARDO = 'arduino_leonardo',
  ARDUINO_MICRO = 'arduino_micro',
  ARDUINO_DUE = 'arduino_due',
  ARDUINO_PRO_MINI = 'arduino_pro_mini',

  // ESP boards
  ESP8266 = 'esp8266',
  ESP32 = 'esp32',
  ESP32_S2 = 'esp32_s2',
  ESP32_S3 = 'esp32_s3',
  ESP32_C3 = 'esp32_c3',
  ESP32_C6 = 'esp32_c6',
  ESP32_H2 = 'esp32_h2',

  // Expansion boards (future)
  RASPBERRY_PI_PICO = 'raspberry_pi_pico',
  STM32 = 'stm32',
  TEENSY = 'teensy',
  SEEED_XIAO = 'seeed_xiao',
  AVR_BOARD = 'avr_board',
  ARM_BOARD = 'arm_board',

  // Unknown
  UNKNOWN = 'unknown'
}

/**
 * Board connection interface
 */
export interface BoardConnection {
  port: string;
  vid?: string;
  pid?: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  locationId?: string;
}

/**
 * Detected board information
 */
export interface DetectedBoard {
  id: string;
  type: BoardType;
  name: string;
  connection: BoardConnection;
  chipset?: string;
  firmwareVersion?: string;
  capabilities: BoardCapabilities;
  metadata: Record<string, unknown>;
  detectedAt: Date;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Board capabilities
 */
export interface BoardCapabilities {
  digitalPins: number;
  analogPins: number;
  pwmPins: number;
  serialPorts: number;
  i2c: boolean;
  spi: boolean;
  wifi: boolean;
  bluetooth: boolean;
  flashSize: number; // in KB
  ramSize: number; // in KB
  clockSpeed: number; // in MHz
  voltage: number; // 3.3 or 5
  supportedProtocols: string[];
}

/**
 * Arduino CLI configuration
 */
export interface ArduinoCliConfig {
  path: string;
  version: string;
  boardManagerUrl: string[];
  libraryPaths: string[];
  sketchbookPath: string;
  corePaths: string[];
}

/**
 * PlatformIO configuration
 */
export interface PlatformIOConfig {
  path: string;
  version: string;
  homeDir: string;
  platformsDir: string;
  packagesDir: string;
}

/**
 * ESP tool configuration
 */
export interface EspToolConfig {
  esptoolPath: string;
  espressifToolPath: string;
  version: string;
}

/**
 * Compilation result
 */
export interface CompileResult {
  success: boolean;
  output: string;
  errors: CompileError[];
  warnings: CompileWarning[];
  binaryPath?: string;
  binarySize?: number;
  duration: number;
}

/**
 * Compile error
 */
export interface CompileError {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
  code?: string;
}

/**
 * Compile warning
 */
export interface CompileWarning {
  file: string;
  line: number;
  column: number;
  message: string;
  code?: string;
}

/**
 * Upload result
 */
export interface UploadResult {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
  verifyResult?: VerifyResult;
}

/**
 * Verification result
 */
export interface VerifyResult {
  success: boolean;
  output: string;
  error?: string;
}

/**
 * Sketch/project information
 */
export interface SketchInfo {
  name: string;
  path: string;
  boardType: BoardType;
  fqbn: string; // Fully Qualified Board Name
  sourceFiles: string[];
  libraries: LibraryDependency[];
  config: SketchConfig;
}

/**
 * Sketch configuration
 */
export interface SketchConfig {
  defines: Record<string, string>;
  includes: string[];
  cppStandard: string;
  optimizationLevel: 'debug' | 'release' | 'size' | 'speed';
  warningsLevel: 'none' | 'default' | 'more' | 'all';
}

/**
 * Library dependency
 */
export interface LibraryDependency {
  name: string;
  version?: string;
  source: 'arduino' | 'platformio' | 'github' | 'local' | 'url';
  path?: string;
  url?: string;
}

/**
 * Serial monitor configuration
 */
export interface SerialMonitorConfig {
  port: string;
  baudRate: number;
  dataBits: 5 | 6 | 7 | 8;
  stopBits: 1 | 2;
  parity: 'none' | 'even' | 'odd' | 'mark' | 'space';
  rtscts: boolean;
  xon: boolean;
  xoff: boolean;
  xany: boolean;
  autoOpen: boolean;
  bufferSize: number;
  encoding: BufferEncoding;
  delimiter?: string;
}

/**
 * Serial data event
 */
export interface SerialDataEvent {
  timestamp: Date;
  port: string;
  data: string;
  rawData: Buffer;
  isError: boolean;
}

/**
 * Diagnostic result
 */
export interface DiagnosticResult {
  boardId: string;
  timestamp: Date;
  status: 'healthy' | 'warning' | 'error' | 'critical';
  checks: DiagnosticCheck[];
  summary: string;
  recommendations: string[];
}

/**
 * Individual diagnostic check
 */
export interface DiagnosticCheck {
  name: string;
  category: 'hardware' | 'software' | 'connection' | 'firmware' | 'configuration';
  status: 'pass' | 'fail' | 'warning' | 'skip';
  message: string;
  details?: Record<string, unknown>;
  fixable: boolean;
  autoFixAvailable: boolean;
}

/**
 * Auto-fix attempt
 */
export interface AutoFixAttempt {
  id: string;
  timestamp: Date;
  errorCategory: string;
  description: string;
  changes: CodeChange[];
  result: 'success' | 'partial' | 'failed';
  compileResult?: CompileResult;
  errorMessage?: string;
}

/**
 * Code change
 */
export interface CodeChange {
  file: string;
  line: number;
  oldCode: string;
  newCode: string;
  reason: string;
}

/**
 * MCP Tool input/output schemas
 */
export interface ToolSchema {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

/**
 * Configuration for the plugin
 */
export interface BoardPluginConfig {
  version: string;
  arduino: ArduinoConfig;
  esp: EspConfig;
  platformio: PlatformIOConfig;
  serial: SerialConfig;
  compiler: CompilerConfig;
  uploader: UploaderConfig;
  debugger: DebuggerConfig;
  autofix: AutoFixConfig;
  libraries: LibraryConfig;
  integrations: IntegrationConfig;
  logging: LoggingConfig;
}

/**
 * Arduino-specific configuration
 */
export interface ArduinoConfig {
  cliPath?: string;
  autoInstall: boolean;
  boardManagerUrls: string[];
  defaultFqbn: string;
  sketchbookPath?: string;
  libraryPaths: string[];
}

/**
 * ESP-specific configuration
 */
export interface EspConfig {
  esptoolPath?: string;
  espressifToolPath?: string;
  autoInstall: boolean;
  defaultBaudRate: number;
  flashMode: 'dio' | 'qio' | 'dout' | 'qout';
  flashFreq: '40m' | '26m' | '20m' | '80m';
  flashSize: '1MB' | '2MB' | '4MB' | '8MB' | '16MB';
}

/**
 * Serial configuration
 */
export interface SerialConfig {
  defaultBaudRate: number;
  defaultTimeout: number;
  maxBufferSize: number;
  reconnectAttempts: number;
  reconnectDelay: number;
}

/**
 * Compiler configuration
 */
export interface CompilerConfig {
  defaultOptimization: 'debug' | 'release' | 'size' | 'speed';
  defaultWarnings: 'none' | 'default' | 'more' | 'all';
  cacheEnabled: boolean;
  cacheDir: string;
  parallelJobs: number;
}

/**
 * Uploader configuration
 */
export interface UploaderConfig {
  verifyAfterUpload: boolean;
  defaultBaudRate: number;
  eraseBeforeUpload: boolean;
  resetMethod: 'dtr' | 'rts' | 'none';
}

/**
 * Debugger configuration
 */
export interface DebuggerConfig {
  enableSerialMonitor: boolean;
  logDir: string;
  maxLogFiles: number;
  maxLogSize: number; // in MB
  crashDetectionEnabled: boolean;
  bootLoopDetectionEnabled: boolean;
}

/**
 * Auto-fix configuration
 */
export interface AutoFixConfig {
  maxAttempts: number;
  enabled: boolean;
  backupOriginal: boolean;
  strategies: FixStrategy[];
  timeout: number; // in seconds
}

/**
 * Fix strategy
 */
export interface FixStrategy {
  name: string;
  priority: number;
  enabled: boolean;
  errorPatterns: string[];
  fixFunction: string; // reference to fix function
}

/**
 * Library configuration
 */
export interface LibraryConfig {
  autoInstall: boolean;
  searchPaths: string[];
  preferredSources: ('arduino' | 'platformio' | 'github')[];
  versionPolicy: 'latest' | 'pinned' | 'compatible';
}

/**
 * Integration configuration
 */
export interface IntegrationConfig {
  claudeCode: ClaudeCodeIntegrationConfig;
  opencode: OpenCodeIntegrationConfig;
}

/**
 * Claude Code integration config
 */
export interface ClaudeCodeIntegrationConfig {
  enabled: boolean;
  configPath?: string;
  mcpServerName: string;
  autoRegister: boolean;
}

/**
 * OpenCode integration config
 */
export interface OpenCodeIntegrationConfig {
  enabled: boolean;
  configPath?: string;
  mcpServerName: string;
  autoRegister: boolean;
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  console: boolean;
  file: boolean;
  filePath: string;
  maxFiles: number;
  maxSize: number; // in MB
}

/**
 * Event types for event-driven architecture
 */
export interface BoardPluginEvents {
  'board:detected': (board: DetectedBoard) => void;
  'board:removed': (boardId: string) => void;
  'board:changed': (board: DetectedBoard) => void;
  'compile:started': (sketch: SketchInfo) => void;
  'compile:completed': (result: CompileResult) => void;
  'compile:failed': (result: CompileResult) => void;
  'upload:started': (boardId: string, binaryPath: string) => void;
  'upload:completed': (result: UploadResult) => void;
  'upload:failed': (result: UploadResult) => void;
  'serial:data': (event: SerialDataEvent) => void;
  'serial:error': (port: string, error: Error) => void;
  'serial:closed': (port: string) => void;
  'diagnostic:completed': (result: DiagnosticResult) => void;
  'autofix:started': (attempt: AutoFixAttempt) => void;
  'autofix:completed': (attempt: AutoFixAttempt) => void;
  'autofix:failed': (attempt: AutoFixAttempt) => void;
  'config:changed': (config: BoardPluginConfig) => void;
  'error': (error: Error, context: string) => void;
}

/**
 * Result wrapper for operations
 */
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

/**
 * Pagination for list operations
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
    latency?: number;
  }[];
  timestamp: Date;
}