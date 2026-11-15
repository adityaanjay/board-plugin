/**
 * Arduino Manager Module
 * Provides Arduino CLI integration for compiling and uploading sketches
 */

import { EventEmitter } from 'eventemitter3';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { join, basename } from 'path';
import { existsSync } from 'fs';
import pino, { Logger } from 'pino';
import type { Module, CoreEngineStatus, HealthCheckResult } from '@board/core-engine';
import type { BoardDatabase, BoardDefinition, BoardVariant } from '@board/board-database';
import type { HardwareDetector } from '@board/hardware-detection';
import type { SerialManager } from '@board/serial-comm';
import {
  DEFAULT_ARDUINO_CLI_CONFIG,
} from './types.js';
import type {
  ArduinoCliConfig,
  SketchConfig,
  CompileResult,
  UploadResult,
  ArduinoBoardInfo,
  ArduinoCoreInfo,
  ArduinoManagerEvents,
  ArduinoManagerOptions,
} from './types.js';

const execFileAsync = promisify(execFile);

/**
 * Arduino Manager class
 * Manages Arduino CLI operations for compiling and uploading
 */
export class ArduinoManager implements Module {
  public readonly name = 'arduino-manager';
  public readonly version = '0.1.0';
  public readonly dependencies: string[] = ['board-database', 'hardware-detection', 'serial-comm'];

  private readonly emitter: EventEmitter<ArduinoManagerEvents>;
  private config: ArduinoCliConfig;
  private logger: Logger;
  private status: CoreEngineStatus = 'created';
  private boardDatabase: BoardDatabase | undefined;
  private hardwareDetector: HardwareDetector | undefined;
  private _serialManager: SerialManager | undefined;
  private cliPath: string = 'arduino-cli';
  private cliVersion: string = '';

  constructor(
    options: ArduinoManagerOptions = {},
    boardDatabase?: BoardDatabase,
    hardwareDetector?: HardwareDetector,
    serialManager?: SerialManager
  ) {
    this.emitter = new EventEmitter<ArduinoManagerEvents>();

    this.config = {
      ...DEFAULT_ARDUINO_CLI_CONFIG,
      ...options.config,
    };

    this.logger = options.logger || pino({ level: 'info' });
    this.boardDatabase = boardDatabase;
    this.hardwareDetector = hardwareDetector;
    this._serialManager = serialManager;
    // Silence unused variable warning - serialManager is a dependency for future use
    void this._serialManager;
  }

  /**
   * Get the internal event emitter
   */
  getEmitter(): EventEmitter<ArduinoManagerEvents> {
    return this.emitter;
  }

  /**
   * Subscribe to an event
   */
  on(event: keyof ArduinoManagerEvents, listener: (...args: any[]) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  /**
   * Unsubscribe from an event
   */
  off(event: keyof ArduinoManagerEvents, listener: (...args: any[]) => void): this {
    this.emitter.off(event, listener);
    return this;
  }

  /**
   * Subscribe to an event once
   */
  once(event: keyof ArduinoManagerEvents, listener: (...args: any[]) => void): this {
    this.emitter.once(event, listener);
    return this;
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: keyof ArduinoManagerEvents): this {
    this.emitter.removeAllListeners(event);
    return this;
  }

  /**
   * Initialize the Arduino manager
   * Module interface implementation
   */
  async initialize(_core: any): Promise<void> {
    if (this.status !== 'created') {
      throw new Error(`Cannot initialize module in state: ${this.status}`);
    }

    this.status = 'initializing';
    this.logger.info('Initializing Arduino manager');

    // Find arduino-cli executable
    await this.findCli();

    // Update board index
    await this.updateBoardIndex();

    this.status = 'initialized';
    this.logger.info('Arduino manager initialized');
  }

  /**
   * Start the Arduino manager
   * Module interface implementation
   */
  async start(): Promise<void> {
    if (this.status !== 'initialized') {
      throw new Error(`Cannot start module in state: ${this.status}`);
    }

    this.status = 'starting';
    this.logger.info('Starting Arduino manager');

    this.status = 'started';
    this.logger.info('Arduino manager started');
  }

  /**
   * Stop the Arduino manager
   * Module interface implementation
   */
  async stop(): Promise<void> {
    if (this.status !== 'started') {
      throw new Error(`Cannot stop module in state: ${this.status}`);
    }

    this.status = 'stopping';
    this.logger.info('Stopping Arduino manager');

    this.status = 'stopped';
    this.logger.info('Arduino manager stopped');
  }

  /**
   * Destroy the Arduino manager (cleanup)
   * Module interface implementation
   */
  async destroy(): Promise<void> {
    if (this.status === 'destroyed') {
      return;
    }

    this.logger.info('Destroying Arduino manager');
    this.removeAllListeners();
    this.status = 'destroyed';
    this.logger.info('Arduino manager destroyed');
  }

  /**
   * Get current module status
   */
  getStatus(): CoreEngineStatus {
    return this.status;
  }

  /**
   * Health check
   * Module interface implementation
   */
  async healthCheck(): Promise<HealthCheckResult> {
    try {
      // Test if arduino-cli works
      const { stdout } = await execFileAsync(this.cliPath, ['version']);
      const version = stdout.trim();
      return {
        status: 'healthy',
        checks: [
          {
            name: 'arduino-cli',
            status: 'pass',
            message: `Arduino CLI version: ${version}`,
            latency: 0,
          },
        ],
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        checks: [
          {
            name: 'arduino-cli',
            status: 'fail',
            message: `Arduino CLI check failed: ${error}`,
            latency: 0,
          },
        ],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Find arduino-cli executable
   */
  private async findCli(): Promise<void> {
    if (this.config.cliPath) {
      this.cliPath = this.config.cliPath;
      return;
    }

    // Try common locations
    const possiblePaths = [
      'arduino-cli',
      join(process.env.HOME || '', '.arduino', 'bin', 'arduino-cli'),
      '/usr/local/bin/arduino-cli',
      '/opt/homebrew/bin/arduino-cli',
    ];

    for (const path of possiblePaths) {
      try {
        const { stdout } = await execFileAsync(path, ['version']);
        this.cliPath = path;
        this.cliVersion = stdout.trim();
        this.logger.info({ path, version: this.cliVersion }, 'Found Arduino CLI');
        return;
      } catch {
        // Continue to next path
      }
    }

    // If not found and autoInstall is enabled, we could install it
    if (this.config.autoInstall) {
      this.logger.warn('Arduino CLI not found, auto-install not implemented yet');
    }

    throw new Error('Arduino CLI not found. Please install arduino-cli or set config.cliPath');
  }

  /**
   * Run arduino-cli command
   */
  private async runCli(args: string[]): Promise<{ stdout: string; stderr: string }> {
    const startTime = Date.now();
    try {
      const result = await execFileAsync(this.cliPath, args);
      const duration = Date.now() - startTime;
      this.logger.debug({ args, duration, stdout: result.stdout }, 'Arduino CLI command completed');
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.logger.error({ args, duration, error: error.message, stderr: error.stderr }, 'Arduino CLI command failed');
      throw error;
    }
  }

  /**
   * Update board index
   */
  async updateBoardIndex(): Promise<void> {
    this.logger.info('Updating board index');
    await this.runCli(['core', 'update-index', '--additional-urls', this.config.boardManagerUrls.join(',')]);
  }

  /**
   * List all boards
   */
  async listBoards(): Promise<ArduinoBoardInfo[]> {
    const { stdout } = await this.runCli(['board', 'listall', '--format', 'json']);
    try {
      return JSON.parse(stdout);
    } catch {
      return [];
    }
  }

  /**
   * List installed cores
   */
  async listCores(): Promise<ArduinoCoreInfo[]> {
    const { stdout } = await this.runCli(['core', 'list', '--format', 'json']);
    try {
      return JSON.parse(stdout);
    } catch {
      return [];
    }
  }

  /**
   * Install a core
   */
  async installCore(core: string): Promise<void> {
    this.logger.info({ core }, 'Installing Arduino core');
    await this.runCli(['core', 'install', core]);
    this.emitter.emit('core:installed', core, '');
  }

  /**
   * Compile a sketch
   */
  async compile(sketchConfig: SketchConfig): Promise<CompileResult> {
    const startTime = Date.now();
    const { sketchPath, fqbn, buildOptions } = sketchConfig;

    this.emitter.emit('compile:start', sketchPath, fqbn);

    const args = ['compile', '--fqbn', fqbn];

    if (buildOptions?.verbose) {
      args.push('--verbose');
    }

    if (buildOptions?.clean) {
      args.push('--clean');
    }

    if (buildOptions?.buildPath) {
      args.push('--build-path', buildOptions.buildPath);
    }

    if (buildOptions?.cachePath) {
      args.push('--build-cache-path', buildOptions.cachePath);
    }

    if (buildOptions?.properties) {
      for (const [key, value] of Object.entries(buildOptions.properties)) {
        args.push('--build-property', `${key}=${value}`);
      }
    }

    if (buildOptions?.warnings) {
      args.push('--warnings', buildOptions.warnings);
    }

    if (buildOptions?.optimization) {
      args.push('--optimize-for', buildOptions.optimization);
    }

    args.push(sketchPath);

    try {
      const { stdout, stderr } = await this.runCli(args);
      const duration = Date.now() - startTime;

      // Find the binary file
      const binaryPath = this.findBinary(sketchPath, fqbn, buildOptions?.buildPath);

      const result: CompileResult = {
        success: true,
        sketchPath,
        fqbn,
        binaryPath,
        buildPath: buildOptions?.buildPath,
        output: stdout + stderr,
        error: undefined,
        duration,
      };

      this.emitter.emit('compile:complete', result);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const result: CompileResult = {
        success: false,
        sketchPath,
        fqbn,
        binaryPath: undefined,
        buildPath: buildOptions?.buildPath,
        output: error.stdout || '',
        error: error.stderr || error.message,
        duration,
      };

      this.emitter.emit('compile:error', sketchPath, fqbn, error);
      return result;
    }
  }

  /**
   * Upload a sketch
   */
  async upload(sketchConfig: SketchConfig): Promise<UploadResult> {
    const startTime = Date.now();
    const { sketchPath, fqbn, uploadOptions } = sketchConfig;
    const port = uploadOptions?.port || (await this.detectUploadPort(fqbn));

    if (!port) {
      throw new Error('No upload port specified and could not auto-detect');
    }

    this.emitter.emit('upload:start', port, fqbn);

    const args = ['upload', '--fqbn', fqbn, '--port', port];

    if (uploadOptions?.verify !== false) {
      args.push('--verify');
    }

    if (uploadOptions?.protocol) {
      args.push('--protocol', uploadOptions.protocol);
    }

    if (uploadOptions?.baudRate) {
      args.push('--baud', uploadOptions.baudRate.toString());
    }

    args.push(sketchPath);

    try {
      const { stdout, stderr } = await this.runCli(args);
      const duration = Date.now() - startTime;

      const result: UploadResult = {
        success: true,
        port,
        fqbn,
        output: stdout + stderr,
        error: undefined,
        duration,
        verified: uploadOptions?.verify !== false,
      };

      this.emitter.emit('upload:complete', result);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const result: UploadResult = {
        success: false,
        port,
        fqbn,
        output: error.stdout || '',
        error: error.stderr || error.message,
        duration,
        verified: undefined,
      };

      this.emitter.emit('upload:error', port, fqbn, error);
      return result;
    }
  }

  /**
   * Compile and upload a sketch in one step
   */
  async compileAndUpload(sketchConfig: SketchConfig): Promise<{ compile: CompileResult; upload: UploadResult }> {
    const compileResult = await this.compile(sketchConfig);
    if (!compileResult.success) {
      return {
        compile: compileResult,
        upload: { success: false, port: '', fqbn: '', output: '', error: 'Compile failed', duration: 0, verified: undefined },
      };
    }
    const uploadResult = await this.upload(sketchConfig);
    return { compile: compileResult, upload: uploadResult };
  }

  /**
   * Detect upload port based on board FQBN
   */
  private async detectUploadPort(_fqbn: string): Promise<string | undefined> {
    if (!this.hardwareDetector) {
      return undefined;
    }

    const devices = this.hardwareDetector.getDevices();
    for (const device of devices) {
      if (device.boardDetection) {
        const board = device.boardDetection.board;
        const variant = device.boardDetection.variant;
        if (variant.fqbn === _fqbn || board.variants.some((v) => v.fqbn === _fqbn)) {
          return device.port;
        }
      }
    }

    return undefined;
  }

  /**
   * Find compiled binary path
   */
  private findBinary(sketchPath: string, _fqbn: string, buildPath?: string): string | undefined {
    const sketchName = basename(sketchPath);
    const searchPaths = buildPath
      ? [buildPath]
      : [
          join(sketchPath, 'build'),
          join(process.env.TMPDIR || '/tmp', 'arduino', 'build'),
        ];

    for (const path of searchPaths) {
      const binaryName = `${sketchName}.ino.bin`;
      const fullPath = join(path, binaryName);
      if (existsSync(fullPath)) {
        return fullPath;
      }

      // Also try hex
      const hexPath = join(path, `${sketchName}.ino.hex`);
      if (existsSync(hexPath)) {
        return hexPath;
      }
    }

    return undefined;
  }

  /**
   * Get board info from board database
   */
  getBoardInfo(boardId: string, variantId?: string): { board: BoardDefinition | undefined; variant: BoardVariant | undefined } {
    if (!this.boardDatabase) {
      return { board: undefined, variant: undefined };
    }

    const board = this.boardDatabase.getBoard(boardId);
    if (!board) {
      return { board: undefined, variant: undefined };
    }

    const variant = variantId
      ? board.variants.find((v) => v.id === variantId)
      : board.variants.find((v) => v.id === board.defaultVariant);

    return { board, variant };
  }

  /**
   * Get FQBN for a board
   */
  getFqbn(boardId: string, variantId?: string): string | undefined {
    const { variant } = this.getBoardInfo(boardId, variantId);
    return variant?.fqbn;
  }

  /**
   * Set dependencies (for testing or dynamic updates)
   */
  setBoardDatabase(boardDatabase: BoardDatabase): void {
    this.boardDatabase = boardDatabase;
  }

  setHardwareDetector(hardwareDetector: HardwareDetector): void {
    this.hardwareDetector = hardwareDetector;
  }

  setSerialManager(serialManager: SerialManager): void {
    this._serialManager = serialManager;
  }
}

/**
 * Create an Arduino manager instance
 */
export function createArduinoManager(
  options: ArduinoManagerOptions = {},
  boardDatabase?: BoardDatabase,
  hardwareDetector?: HardwareDetector,
  serialManager?: SerialManager
): ArduinoManager {
  return new ArduinoManager(options, boardDatabase, hardwareDetector, serialManager);
}