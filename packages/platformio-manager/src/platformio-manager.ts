/**
 * PlatformIO Manager Module
 * Provides PlatformIO integration for building, uploading, and debugging
 */

import { EventEmitter } from 'eventemitter3';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync } from 'fs';
import pino, { Logger } from 'pino';
import type { Module, CoreEngineStatus, HealthCheckResult } from '@board/core-engine';
import type { BoardDatabase, BoardDefinition, BoardVariant } from '@board/board-database';
import type { HardwareDetector } from '@board/hardware-detection';
import type { SerialManager } from '@board/serial-comm';
import {
  DEFAULT_PLATFORMIO_CONFIG,
} from './types.js';
import type {
  PlatformIOConfig,
  BuildOptions,
  UploadOptions,
  BuildResult,
  UploadResult,
  PlatformIOPlatform,
  PlatformIOBoard,
  PlatformIOManagerEvents,
  PlatformIOManagerOptions,
} from './types.js';

const execFileAsync = promisify(execFile);

/**
 * PlatformIO Manager class
 * Manages PlatformIO operations for building, uploading, and debugging
 */
export class PlatformIOManager implements Module {
  public readonly name = 'platformio-manager';
  public readonly version = '0.1.0';
  public readonly dependencies: string[] = ['board-database', 'hardware-detection', 'serial-comm'];

  private readonly emitter: EventEmitter<PlatformIOManagerEvents>;
  private config: PlatformIOConfig;
  private logger: Logger;
  private status: CoreEngineStatus = 'created';
  private boardDatabase: BoardDatabase | undefined;
  private hardwareDetector: HardwareDetector | undefined;
  private serialManager: SerialManager | undefined;
  private pioPath: string = 'pio';
  private pioVersion: string = '';

  constructor(
    options: PlatformIOManagerOptions = {},
    boardDatabase?: BoardDatabase,
    hardwareDetector?: HardwareDetector,
    serialManager?: SerialManager
  ) {
    this.emitter = new EventEmitter<PlatformIOManagerEvents>();

    this.config = {
      ...DEFAULT_PLATFORMIO_CONFIG,
      ...options.config,
    };

    this.logger = options.logger || pino({ level: 'info' });
    this.boardDatabase = boardDatabase;
    this.hardwareDetector = hardwareDetector;
    this.serialManager = serialManager;

    // Silence unused variable warnings - these are dependencies for future use
    void this.hardwareDetector;
    void this.serialManager;
  }

  /**
   * Get the internal event emitter
   */
  getEmitter(): EventEmitter<PlatformIOManagerEvents> {
    return this.emitter;
  }

  /**
   * Subscribe to an event
   */
  on(event: keyof PlatformIOManagerEvents, listener: (...args: any[]) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  /**
   * Unsubscribe from an event
   */
  off(event: keyof PlatformIOManagerEvents, listener: (...args: any[]) => void): this {
    this.emitter.off(event, listener);
    return this;
  }

  /**
   * Subscribe to an event once
   */
  once(event: keyof PlatformIOManagerEvents, listener: (...args: any[]) => void): this {
    this.emitter.once(event, listener);
    return this;
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: keyof PlatformIOManagerEvents): this {
    this.emitter.removeAllListeners(event);
    return this;
  }

  /**
   * Initialize the PlatformIO manager
   * Module interface implementation
   */
  async initialize(_core: any): Promise<void> {
    if (this.status !== 'created') {
      throw new Error(`Cannot initialize module in state: ${this.status}`);
    }

    this.status = 'initializing';
    this.logger.info('Initializing PlatformIO manager');

    // Find platformio executable
    await this.findPio();

    this.status = 'initialized';
    this.logger.info('PlatformIO manager initialized');
  }

  /**
   * Start the PlatformIO manager
   * Module interface implementation
   */
  async start(): Promise<void> {
    if (this.status !== 'initialized') {
      throw new Error(`Cannot start module in state: ${this.status}`);
    }

    this.status = 'starting';
    this.logger.info('Starting PlatformIO manager');

    this.status = 'started';
    this.logger.info('PlatformIO manager started');
  }

  /**
   * Stop the PlatformIO manager
   * Module interface implementation
   */
  async stop(): Promise<void> {
    if (this.status !== 'started') {
      throw new Error(`Cannot stop module in state: ${this.status}`);
    }

    this.status = 'stopping';
    this.logger.info('Stopping PlatformIO manager');

    this.status = 'stopped';
    this.logger.info('PlatformIO manager stopped');
  }

  /**
   * Destroy the PlatformIO manager (cleanup)
   * Module interface implementation
   */
  async destroy(): Promise<void> {
    if (this.status === 'destroyed') {
      return;
    }

    this.logger.info('Destroying PlatformIO manager');
    this.removeAllListeners();
    this.status = 'destroyed';
    this.logger.info('PlatformIO manager destroyed');
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
      // Test if platformio works
      const { stdout } = await execFileAsync(this.pioPath, ['--version']);
      const version = stdout.trim();
      return {
        status: 'healthy',
        checks: [
          {
            name: 'platformio',
            status: 'pass',
            message: `PlatformIO version: ${version}`,
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
            name: 'platformio',
            status: 'fail',
            message: `PlatformIO check failed: ${error}`,
            latency: 0,
          },
        ],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Find platformio executable
   */
  private async findPio(): Promise<void> {
    if (this.config.pioPath) {
      this.pioPath = this.config.pioPath;
      return;
    }

    // Try common locations
    const possiblePaths = [
      'pio',
      join(process.env.HOME || '', '.platformio', 'penv', 'bin', 'pio'),
      '/usr/local/bin/pio',
      '/opt/homebrew/bin/pio',
    ];

    for (const path of possiblePaths) {
      try {
        const { stdout } = await execFileAsync(path, ['--version']);
        this.pioPath = path;
        this.pioVersion = stdout.trim();
        this.logger.info({ path, version: this.pioVersion }, 'Found PlatformIO');
        return;
      } catch {
        // Continue to next path
      }
    }

    // If not found and autoInstall is enabled
    if (this.config.autoInstall) {
      this.logger.warn('PlatformIO not found, auto-install not implemented yet');
    }

    throw new Error('PlatformIO not found. Please install PlatformIO or set config.pioPath');
  }

  /**
   * Run platformio command
   */
  private async runPio(args: string[], cwd?: string): Promise<{ stdout: string; stderr: string }> {
    const startTime = Date.now();
    try {
      const result = await execFileAsync(this.pioPath, args, { cwd });
      const duration = Date.now() - startTime;
      this.logger.debug({ args, duration, cwd, stdout: result.stdout }, 'PlatformIO command completed');
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.logger.error({ args, duration, cwd, error: error.message, stderr: error.stderr }, 'PlatformIO command failed');
      throw error;
    }
  }

  /**
   * List installed platforms
   */
  async listPlatforms(): Promise<PlatformIOPlatform[]> {
    const { stdout } = await this.runPio(['platform', 'list', '--json-output']);
    try {
      return JSON.parse(stdout);
    } catch {
      return [];
    }
  }

  /**
   * Install a platform
   */
  async installPlatform(platform: string): Promise<void> {
    this.logger.info({ platform }, 'Installing PlatformIO platform');
    await this.runPio(['platform', 'install', platform]);
    this.emitter.emit('platform:installed', platform, '');
  }

  /**
   * List boards for a platform
   */
  async listBoards(platform?: string): Promise<PlatformIOBoard[]> {
    const args = ['boards'];
    if (platform) {
      args.push(platform);
    }
    args.push('--json-output');

    const { stdout } = await this.runPio(args);
    try {
      return JSON.parse(stdout);
    } catch {
      return [];
    }
  }

  /**
   * Build a project
   */
  async build(projectPath: string, options: BuildOptions = {}): Promise<BuildResult> {
    const startTime = Date.now();
    const { environment, verbose, clean, upload, uploadPort } = options;

    this.emitter.emit('build:start', projectPath, environment || this.config.defaultEnv);

    const args = ['run'];
    if (environment) {
      args.push('-e', environment);
    }
    if (verbose) {
      args.push('-v');
    }
    if (clean) {
      args.push('-t', 'clean');
    }
    if (upload) {
      args.push('-t', 'upload');
      if (uploadPort) {
        args.push('--upload-port', uploadPort);
      }
    }

    try {
      const { stdout, stderr } = await this.runPio(args, projectPath);
      const duration = Date.now() - startTime;

      // Find firmware path
      const firmwarePath = this.findFirmware(projectPath, environment || this.config.defaultEnv);

      const result: BuildResult = {
        success: true,
        projectPath,
        environment: environment || this.config.defaultEnv,
        output: stdout + stderr,
        error: undefined,
        duration,
        firmwarePath,
      };

      this.emitter.emit('build:complete', result);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const result: BuildResult = {
        success: false,
        projectPath,
        environment: environment || this.config.defaultEnv,
        output: error.stdout || '',
        error: error.stderr || error.message,
        duration,
        firmwarePath: undefined,
      };

      this.emitter.emit('build:error', projectPath, environment || this.config.defaultEnv, error);
      return result;
    }
  }

  /**
   * Upload firmware to board
   */
  async upload(projectPath: string, options: UploadOptions = {}): Promise<UploadResult> {
    const startTime = Date.now();
    const { environment, port, verbose } = options;

    const env = environment || this.config.defaultEnv;
    this.emitter.emit('upload:start', projectPath, env, port || 'auto');

    const args = ['run', '-t', 'upload', '-e', env];
    if (verbose) {
      args.push('-v');
    }
    if (port) {
      args.push('--upload-port', port);
    }

    try {
      const { stdout, stderr } = await this.runPio(args, projectPath);
      const duration = Date.now() - startTime;

      const result: UploadResult = {
        success: true,
        projectPath,
        environment: env,
        port: port || 'auto',
        output: stdout + stderr,
        error: undefined,
        duration,
      };

      this.emitter.emit('upload:complete', result);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const result: UploadResult = {
        success: false,
        projectPath,
        environment: env,
        port: port || 'auto',
        output: error.stdout || '',
        error: error.stderr || error.message,
        duration,
      };

      this.emitter.emit('upload:error', projectPath, env, port || 'auto', error);
      return result;
    }
  }

  /**
   * Build and upload in one step
   */
  async buildAndUpload(projectPath: string, options: BuildOptions & UploadOptions = {}): Promise<{ build: BuildResult; upload: UploadResult }> {
    const buildResult = await this.build(projectPath, options);
    if (!buildResult.success) {
      return {
        build: buildResult,
        upload: { success: false, projectPath, environment: '', port: '', output: '', error: 'Build failed', duration: 0 },
      };
    }
    const uploadResult = await this.upload(projectPath, options);
    return { build: buildResult, upload: uploadResult };
  }

  /**
   * Monitor serial output
   */
  async monitor(projectPath: string, environment?: string, port?: string, baudRate?: number): Promise<void> {
    const env = environment || this.config.defaultEnv;
    const args = ['device', 'monitor', '-e', env];
    if (port) {
      args.push('--port', port);
    }
    if (baudRate) {
      args.push('--baud', baudRate.toString());
    }

    // This would typically be a long-running process
    // For now, we just run it
    await this.runPio(args, projectPath);
  }

  /**
   * Debug a project (start debug server)
   */
  async debug(projectPath: string, environment?: string): Promise<void> {
    const env = environment || this.config.defaultEnv;
    await this.runPio(['debug', '-e', env], projectPath);
  }

  /**
   * Find firmware file
   */
  private findFirmware(projectPath: string, environment: string): string | undefined {
    const buildDir = join(projectPath, '.pio', 'build', environment);
    if (!existsSync(buildDir)) {
      return undefined;
    }

    // Look for common firmware files
    const possibleFiles = [
      'firmware.bin',
      'firmware.elf',
      'firmware.hex',
    ];

    for (const file of possibleFiles) {
      const fullPath = join(buildDir, file);
      if (existsSync(fullPath)) {
        return fullPath;
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
   * Get PlatformIO board ID for a board
   */
  getPlatformIOBoard(boardId: string): string | undefined {
    if (!this.boardDatabase) {
      return undefined;
    }
    return this.boardDatabase.getPlatformIOBoard(boardId);
  }

  /**
   * Create a new PlatformIO project
   */
  async initProject(projectPath: string, boardId: string, framework?: string): Promise<void> {
    const pioBoard = this.getPlatformIOBoard(boardId);
    if (!pioBoard) {
      throw new Error(`No PlatformIO board found for ${boardId}`);
    }

    const args = ['project', 'init', '--board', pioBoard];
    if (framework) {
      args.push('--project-option', `framework=${framework}`);
    }

    await this.runPio(args, projectPath);
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
    this.serialManager = serialManager;
  }
}

/**
 * Create a PlatformIO manager instance
 */
export function createPlatformIOManager(
  options: PlatformIOManagerOptions = {},
  boardDatabase?: BoardDatabase,
  hardwareDetector?: HardwareDetector,
  serialManager?: SerialManager
): PlatformIOManager {
  return new PlatformIOManager(options, boardDatabase, hardwareDetector, serialManager);
}