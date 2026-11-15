"use strict";
/**
 * ESP Manager Module
 * Provides esptool integration for flashing and monitoring ESP boards
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EspManager = void 0;
exports.createEspManager = createEspManager;
const eventemitter3_1 = require("eventemitter3");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = require("path");
const pino_1 = __importDefault(require("pino"));
const types_js_1 = require("./types.js");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
/**
 * ESP Manager class
 * Manages esptool operations for flashing and monitoring ESP boards
 */
class EspManager {
    name = 'esp-manager';
    version = '0.1.0';
    dependencies = ['board-database', 'hardware-detection', 'serial-comm'];
    emitter;
    config;
    logger;
    status = 'created';
    boardDatabase;
    _hardwareDetector;
    serialManager;
    esptoolPath = 'esptool.py';
    esptoolVersion = '';
    constructor(options = {}, boardDatabase, hardwareDetector, serialManager) {
        this.emitter = new eventemitter3_1.EventEmitter();
        this.config = {
            ...types_js_1.DEFAULT_ESP_TOOL_CONFIG,
            ...options.config,
        };
        this.logger = options.logger || (0, pino_1.default)({ level: 'info' });
        this.boardDatabase = boardDatabase;
        this._hardwareDetector = hardwareDetector;
        this.serialManager = serialManager;
        // Silence unused variable warnings - these are dependencies for future use
        void this._hardwareDetector;
        void this.serialManager;
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
     * Initialize the ESP manager
     * Module interface implementation
     */
    async initialize(_core) {
        if (this.status !== 'created') {
            throw new Error(`Cannot initialize module in state: ${this.status}`);
        }
        this.status = 'initializing';
        this.logger.info('Initializing ESP manager');
        // Find esptool executable
        await this.findEsptool();
        this.status = 'initialized';
        this.logger.info('ESP manager initialized');
    }
    /**
     * Start the ESP manager
     * Module interface implementation
     */
    async start() {
        if (this.status !== 'initialized') {
            throw new Error(`Cannot start module in state: ${this.status}`);
        }
        this.status = 'starting';
        this.logger.info('Starting ESP manager');
        this.status = 'started';
        this.logger.info('ESP manager started');
    }
    /**
     * Stop the ESP manager
     * Module interface implementation
     */
    async stop() {
        if (this.status !== 'started') {
            throw new Error(`Cannot stop module in state: ${this.status}`);
        }
        this.status = 'stopping';
        this.logger.info('Stopping ESP manager');
        this.status = 'stopped';
        this.logger.info('ESP manager stopped');
    }
    /**
     * Destroy the ESP manager (cleanup)
     * Module interface implementation
     */
    async destroy() {
        if (this.status === 'destroyed') {
            return;
        }
        this.logger.info('Destroying ESP manager');
        this.removeAllListeners();
        this.status = 'destroyed';
        this.logger.info('ESP manager destroyed');
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
            // Test if esptool works
            const { stdout } = await execFileAsync(this.esptoolPath, ['--version']);
            const version = stdout.trim();
            return {
                status: 'healthy',
                checks: [
                    {
                        name: 'esptool',
                        status: 'pass',
                        message: `esptool version: ${version}`,
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
                        name: 'esptool',
                        status: 'fail',
                        message: `esptool check failed: ${error}`,
                        latency: 0,
                    },
                ],
                timestamp: new Date(),
            };
        }
    }
    /**
     * Find esptool executable
     */
    async findEsptool() {
        if (this.config.esptoolPath) {
            this.esptoolPath = this.config.esptoolPath;
            return;
        }
        // Try common locations
        const possiblePaths = [
            'esptool.py',
            'esptool',
            (0, path_1.join)(process.env.HOME || '', '.espressif', 'tools', 'esptool', 'esptool.py'),
            '/usr/local/bin/esptool.py',
            '/opt/homebrew/bin/esptool.py',
        ];
        for (const path of possiblePaths) {
            try {
                const { stdout } = await execFileAsync(path, ['--version']);
                this.esptoolPath = path;
                this.esptoolVersion = stdout.trim();
                this.logger.info({ path, version: this.esptoolVersion }, 'Found esptool');
                return;
            }
            catch {
                // Continue to next path
            }
        }
        // If not found and autoInstall is enabled
        if (this.config.autoInstall) {
            this.logger.warn('esptool not found, auto-install not implemented yet');
        }
        throw new Error('esptool not found. Please install esptool or set config.esptoolPath');
    }
    /**
     * Run esptool command
     */
    async runEsptool(args) {
        const startTime = Date.now();
        try {
            const result = await execFileAsync(this.esptoolPath, args);
            const duration = Date.now() - startTime;
            this.logger.debug({ args, duration, stdout: result.stdout }, 'esptool command completed');
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error({ args, duration, error: error.message, stderr: error.stderr }, 'esptool command failed');
            throw error;
        }
    }
    /**
     * Detect chip info
     */
    async detectChip(port, baudRate) {
        const args = ['--port', port, '--baud', (baudRate || this.config.defaultBaudRate).toString(), 'chip_id'];
        const { stdout } = await this.runEsptool(args);
        // Parse chip_id output
        const chipInfo = {
            chip: 'unknown',
            features: [],
            crystalFreq: 40,
            macAddress: '',
            flashId: '',
            flashSize: '',
        };
        // Basic parsing - in reality you'd want more robust parsing
        const lines = stdout.split('\n');
        for (const line of lines) {
            if (line.includes('Chip is')) {
                const parts = line.split('Chip is');
                if (parts[1])
                    chipInfo.chip = parts[1].trim();
            }
            else if (line.includes('Features:')) {
                const parts = line.split('Features:');
                if (parts[1])
                    chipInfo.features = parts[1].trim().split(', ').map(f => f.trim());
            }
            else if (line.includes('Crystal is')) {
                const match = line.match(/(\d+)MHz/);
                if (match && match[1])
                    chipInfo.crystalFreq = parseInt(match[1], 10);
            }
            else if (line.includes('MAC:')) {
                const parts = line.split('MAC:');
                if (parts[1])
                    chipInfo.macAddress = parts[1].trim();
            }
            else if (line.includes('Flash ID:')) {
                const parts = line.split('Flash ID:');
                if (parts[1])
                    chipInfo.flashId = parts[1].trim();
            }
        }
        this.emitter.emit('chip:detected', chipInfo);
        return chipInfo;
    }
    /**
     * Flash a binary to ESP board
     */
    async flash(options) {
        const startTime = Date.now();
        const { port, address, binaryPath, baudRate, chip, flashMode, flashFreq, flashSize, verify, compress, eraseAll, noStub } = options;
        this.emitter.emit('flash:start', port, chip || 'auto', address);
        const args = [
            '--port', port,
            '--baud', (baudRate || this.config.defaultBaudRate).toString(),
        ];
        if (chip) {
            args.push('--chip', chip);
        }
        if (flashMode) {
            args.push('--flash_mode', flashMode);
        }
        else {
            args.push('--flash_mode', this.config.flashMode);
        }
        if (flashFreq) {
            args.push('--flash_freq', flashFreq);
        }
        else {
            args.push('--flash_freq', this.config.flashFreq);
        }
        if (flashSize) {
            args.push('--flash_size', flashSize);
        }
        else {
            args.push('--flash_size', this.config.flashSize);
        }
        if (compress !== false) {
            args.push('--compress');
        }
        if (eraseAll) {
            args.push('--erase-all');
        }
        if (noStub) {
            args.push('--no-stub');
        }
        args.push('write_flash', address, binaryPath);
        try {
            const { stdout, stderr } = await this.runEsptool(args);
            const duration = Date.now() - startTime;
            const result = {
                success: true,
                port,
                chip: chip || 'auto',
                address,
                binaryPath,
                output: stdout + stderr,
                error: undefined,
                duration,
                verified: verify !== false,
            };
            // Verify if requested
            if (verify !== false) {
                const verifyResult = await this.verifyFlash(port, address, binaryPath, baudRate);
                result.verified = verifyResult.success;
                if (!verifyResult.success) {
                    result.error = `Verification failed: ${verifyResult.error}`;
                }
            }
            this.emitter.emit('flash:complete', result);
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const result = {
                success: false,
                port,
                chip: chip || 'auto',
                address,
                binaryPath,
                output: error.stdout || '',
                error: error.stderr || error.message,
                duration,
                verified: undefined,
            };
            this.emitter.emit('flash:error', port, chip || 'auto', error);
            return result;
        }
    }
    /**
     * Verify flash
     */
    async verifyFlash(port, address, binaryPath, baudRate) {
        const args = [
            '--port', port,
            '--baud', (baudRate || this.config.defaultBaudRate).toString(),
            'verify_flash', address, binaryPath,
        ];
        try {
            const { stdout, stderr } = await this.runEsptool(args);
            return {
                success: true,
                port,
                chip: 'auto',
                address,
                binaryPath,
                output: stdout + stderr,
                error: undefined,
                duration: 0,
                verified: true,
            };
        }
        catch (error) {
            return {
                success: false,
                port,
                chip: 'auto',
                address,
                binaryPath,
                output: error.stdout || '',
                error: error.stderr || error.message,
                duration: 0,
                verified: undefined,
            };
        }
    }
    /**
     * Erase flash
     */
    async eraseFlash(port, baudRate) {
        const startTime = Date.now();
        const args = [
            '--port', port,
            '--baud', (baudRate || this.config.defaultBaudRate).toString(),
            'erase_flash',
        ];
        try {
            const { stdout, stderr } = await this.runEsptool(args);
            const duration = Date.now() - startTime;
            return {
                success: true,
                port,
                chip: 'auto',
                address: '0x0',
                binaryPath: '',
                output: stdout + stderr,
                error: undefined,
                duration,
                verified: undefined,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            return {
                success: false,
                port,
                chip: 'auto',
                address: '0x0',
                binaryPath: '',
                output: error.stdout || '',
                error: error.stderr || error.message,
                duration,
                verified: undefined,
            };
        }
    }
    /**
     * Read flash
     */
    async readFlash(port, address, size, outputPath, baudRate) {
        const startTime = Date.now();
        const args = [
            '--port', port,
            '--baud', (baudRate || this.config.defaultBaudRate).toString(),
            'read_flash', address, size.toString(), outputPath,
        ];
        try {
            const { stdout, stderr } = await this.runEsptool(args);
            const duration = Date.now() - startTime;
            return {
                success: true,
                port,
                chip: 'auto',
                address,
                binaryPath: outputPath,
                output: stdout + stderr,
                error: undefined,
                duration,
                verified: undefined,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            return {
                success: false,
                port,
                chip: 'auto',
                address,
                binaryPath: outputPath,
                output: error.stdout || '',
                error: error.stderr || error.message,
                duration,
                verified: undefined,
            };
        }
    }
    /**
     * Get partition table
     */
    async getPartitionTable(port, baudRate) {
        const args = [
            '--port', port,
            '--baud', (baudRate || this.config.defaultBaudRate).toString(),
            'read_partition_table',
        ];
        const { stdout: _stdout } = await this.runEsptool(args);
        // Parse partition table output - simplified
        return [];
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
     * Get esptool chip name for a board
     */
    getEsptoolChip(boardId) {
        if (!this.boardDatabase) {
            return undefined;
        }
        return this.boardDatabase.getEsptoolChip(boardId);
    }
    /**
     * Set dependencies (for testing or dynamic updates)
     */
    setBoardDatabase(boardDatabase) {
        this.boardDatabase = boardDatabase;
    }
    setHardwareDetector(hardwareDetector) {
        this._hardwareDetector = hardwareDetector;
    }
    setSerialManager(serialManager) {
        this.serialManager = serialManager;
    }
}
exports.EspManager = EspManager;
/**
 * Create an ESP manager instance
 */
function createEspManager(options = {}, boardDatabase, hardwareDetector, serialManager) {
    return new EspManager(options, boardDatabase, hardwareDetector, serialManager);
}
//# sourceMappingURL=esp-manager.js.map