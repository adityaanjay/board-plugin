"use strict";
/**
 * Arduino Manager Module
 * Provides Arduino CLI integration for compiling and uploading sketches
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArduinoManager = void 0;
exports.createArduinoManager = createArduinoManager;
const eventemitter3_1 = require("eventemitter3");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = require("path");
const fs_1 = require("fs");
const pino_1 = __importDefault(require("pino"));
const types_js_1 = require("./types.js");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
/**
 * Arduino Manager class
 * Manages Arduino CLI operations for compiling and uploading
 */
class ArduinoManager {
    name = 'arduino-manager';
    version = '0.1.0';
    dependencies = ['board-database', 'hardware-detection', 'serial-comm'];
    emitter;
    config;
    logger;
    status = 'created';
    boardDatabase;
    hardwareDetector;
    _serialManager;
    cliPath = 'arduino-cli';
    cliVersion = '';
    constructor(options = {}, boardDatabase, hardwareDetector, serialManager) {
        this.emitter = new eventemitter3_1.EventEmitter();
        this.config = {
            ...types_js_1.DEFAULT_ARDUINO_CLI_CONFIG,
            ...options.config,
        };
        this.logger = options.logger || (0, pino_1.default)({ level: 'info' });
        this.boardDatabase = boardDatabase;
        this.hardwareDetector = hardwareDetector;
        this._serialManager = serialManager;
        // Silence unused variable warning - serialManager is a dependency for future use
        void this._serialManager;
    }
    /**
     * Get the internal event emitter
     */
    getEmitter() {
        return this.emitter;
    }
    /**
     * Subscribe to an event
     */
    on(event, listener) {
        this.emitter.on(event, listener);
        return this;
    }
    /**
     * Unsubscribe from an event
     */
    off(event, listener) {
        this.emitter.off(event, listener);
        return this;
    }
    /**
     * Subscribe to an event once
     */
    once(event, listener) {
        this.emitter.once(event, listener);
        return this;
    }
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event) {
        this.emitter.removeAllListeners(event);
        return this;
    }
    /**
     * Initialize the Arduino manager
     * Module interface implementation
     */
    async initialize(_core) {
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
    async start() {
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
    async stop() {
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
    async destroy() {
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
    getStatus() {
        return this.status;
    }
    /**
     * Health check
     * Module interface implementation
     */
    async healthCheck() {
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
        }
        catch (error) {
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
    async findCli() {
        if (this.config.cliPath) {
            this.cliPath = this.config.cliPath;
            return;
        }
        // Try common locations
        const possiblePaths = [
            'arduino-cli',
            (0, path_1.join)(process.env.HOME || '', '.arduino', 'bin', 'arduino-cli'),
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
            }
            catch {
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
    async runCli(args) {
        const startTime = Date.now();
        try {
            const result = await execFileAsync(this.cliPath, args);
            const duration = Date.now() - startTime;
            this.logger.debug({ args, duration, stdout: result.stdout }, 'Arduino CLI command completed');
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error({ args, duration, error: error.message, stderr: error.stderr }, 'Arduino CLI command failed');
            throw error;
        }
    }
    /**
     * Update board index
     */
    async updateBoardIndex() {
        this.logger.info('Updating board index');
        await this.runCli(['core', 'update-index', '--additional-urls', this.config.boardManagerUrls.join(',')]);
    }
    /**
     * List all boards
     */
    async listBoards() {
        const { stdout } = await this.runCli(['board', 'listall', '--format', 'json']);
        try {
            return JSON.parse(stdout);
        }
        catch {
            return [];
        }
    }
    /**
     * List installed cores
     */
    async listCores() {
        const { stdout } = await this.runCli(['core', 'list', '--format', 'json']);
        try {
            return JSON.parse(stdout);
        }
        catch {
            return [];
        }
    }
    /**
     * Install a core
     */
    async installCore(core) {
        this.logger.info({ core }, 'Installing Arduino core');
        await this.runCli(['core', 'install', core]);
        this.emitter.emit('core:installed', core, '');
    }
    /**
     * Compile a sketch
     */
    async compile(sketchConfig) {
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
            const result = {
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const result = {
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
    async upload(sketchConfig) {
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
            const result = {
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const result = {
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
    async compileAndUpload(sketchConfig) {
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
    async detectUploadPort(_fqbn) {
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
    findBinary(sketchPath, _fqbn, buildPath) {
        const sketchName = (0, path_1.basename)(sketchPath);
        const searchPaths = buildPath
            ? [buildPath]
            : [
                (0, path_1.join)(sketchPath, 'build'),
                (0, path_1.join)(process.env.TMPDIR || '/tmp', 'arduino', 'build'),
            ];
        for (const path of searchPaths) {
            const binaryName = `${sketchName}.ino.bin`;
            const fullPath = (0, path_1.join)(path, binaryName);
            if ((0, fs_1.existsSync)(fullPath)) {
                return fullPath;
            }
            // Also try hex
            const hexPath = (0, path_1.join)(path, `${sketchName}.ino.hex`);
            if ((0, fs_1.existsSync)(hexPath)) {
                return hexPath;
            }
        }
        return undefined;
    }
    /**
     * Get board info from board database
     */
    getBoardInfo(boardId, variantId) {
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
    getFqbn(boardId, variantId) {
        const { variant } = this.getBoardInfo(boardId, variantId);
        return variant?.fqbn;
    }
    /**
     * Set dependencies (for testing or dynamic updates)
     */
    setBoardDatabase(boardDatabase) {
        this.boardDatabase = boardDatabase;
    }
    setHardwareDetector(hardwareDetector) {
        this.hardwareDetector = hardwareDetector;
    }
    setSerialManager(serialManager) {
        this._serialManager = serialManager;
    }
}
exports.ArduinoManager = ArduinoManager;
/**
 * Create an Arduino manager instance
 */
function createArduinoManager(options = {}, boardDatabase, hardwareDetector, serialManager) {
    return new ArduinoManager(options, boardDatabase, hardwareDetector, serialManager);
}
//# sourceMappingURL=arduino-manager.js.map