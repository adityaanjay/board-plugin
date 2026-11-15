"use strict";
/**
 * MCP Server for Board Plugin
 * Provides AI agent tools for hardware programming and debugging
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardMCPServer = void 0;
exports.createMCPServer = createMCPServer;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const pino_1 = __importDefault(require("pino"));
const board_database_1 = require("@board/board-database");
const hardware_detection_1 = require("@board/hardware-detection");
const serial_comm_1 = require("@board/serial-comm");
const arduino_manager_1 = require("@board/arduino-manager");
const esp_manager_1 = require("@board/esp-manager");
const platformio_manager_1 = require("@board/platformio-manager");
/**
 * MCP Server class
 */
class BoardMCPServer {
    server;
    logger;
    boardDatabase;
    hardwareDetector;
    serialManager;
    arduinoManager;
    espManager;
    platformioManager;
    initialized = false;
    constructor(config = {}, logger) {
        this.logger = logger || (0, pino_1.default)({ level: 'info' });
        // Initialize dependencies
        this.boardDatabase = (0, board_database_1.createBoardDatabase)();
        this.hardwareDetector = (0, hardware_detection_1.createHardwareDetector)({ boardDatabase: this.boardDatabase });
        this.serialManager = (0, serial_comm_1.createSerialManager)();
        this.arduinoManager = (0, arduino_manager_1.createArduinoManager)({}, this.boardDatabase, this.hardwareDetector, this.serialManager);
        this.espManager = (0, esp_manager_1.createEspManager)({}, this.boardDatabase, this.hardwareDetector, this.serialManager);
        this.platformioManager = (0, platformio_manager_1.createPlatformIOManager)({}, this.boardDatabase, this.hardwareDetector, this.serialManager);
        // Create MCP server
        this.server = new index_js_1.Server({
            name: config.name || 'board-plugin',
            version: config.version || '0.1.0',
        }, {
            capabilities: {
                tools: {},
                resources: {},
                prompts: {},
            },
        });
        this.setupHandlers();
    }
    /**
     * Setup MCP request handlers
     */
    setupHandlers() {
        // List tools
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'detect_board',
                    description: 'Detect connected board via serial port (VID/PID matching or heuristic)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            port: { type: 'string', description: 'Serial port path (e.g., /dev/ttyUSB0, COM3)' },
                            vid: { type: 'string', description: 'USB Vendor ID (hex)' },
                            pid: { type: 'string', description: 'USB Product ID (hex)' },
                        },
                    },
                },
                {
                    name: 'list_boards',
                    description: 'List all supported boards with optional filtering',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            type: { type: 'string', description: 'Filter by board type (arduino_uno, esp32, etc.)' },
                            search: { type: 'string', description: 'Search query for board name/vendor' },
                        },
                    },
                },
                {
                    name: 'get_board_info',
                    description: 'Get detailed information about a specific board',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            boardId: { type: 'string', description: 'Board ID (e.g., arduino_uno, esp32_devkit_v1)' },
                        },
                        required: ['boardId'],
                    },
                },
                {
                    name: 'compile',
                    description: 'Compile a sketch for Arduino/ESP board',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            sketchPath: { type: 'string', description: 'Path to sketch directory' },
                            boardId: { type: 'string', description: 'Target board ID' },
                            variantId: { type: 'string', description: 'Board variant ID (optional)' },
                            fqbn: { type: 'string', description: 'Override FQBN (optional)' },
                            buildOptions: {
                                type: 'object',
                                properties: {
                                    optimization: { type: 'string', enum: ['debug', 'release', 'size', 'fast'] },
                                    warnings: { type: 'string', enum: ['none', 'default', 'more', 'all'] },
                                    verbose: { type: 'boolean' },
                                    clean: { type: 'boolean' },
                                },
                            },
                        },
                        required: ['sketchPath', 'boardId'],
                    },
                },
                {
                    name: 'upload',
                    description: 'Upload compiled firmware to board',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            sketchPath: { type: 'string', description: 'Path to sketch directory' },
                            boardId: { type: 'string', description: 'Target board ID' },
                            variantId: { type: 'string', description: 'Board variant ID (optional)' },
                            port: { type: 'string', description: 'Serial port (auto-detect if not specified)' },
                            fqbn: { type: 'string', description: 'Override FQBN (optional)' },
                            uploadOptions: {
                                type: 'object',
                                properties: {
                                    verify: { type: 'boolean' },
                                    protocol: { type: 'string' },
                                    baudRate: { type: 'number' },
                                    resetMethod: { type: 'string', enum: ['dtr', 'rts', 'dsr', 'none'] },
                                },
                            },
                        },
                        required: ['sketchPath', 'boardId'],
                    },
                },
                {
                    name: 'flash',
                    description: 'Flash binary to ESP board using esptool',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            port: { type: 'string', description: 'Serial port' },
                            boardId: { type: 'string', description: 'Target board ID' },
                            binaryPath: { type: 'string', description: 'Path to binary file (.bin)' },
                            address: { type: 'string', description: 'Flash address (default: 0x0)' },
                            baudRate: { type: 'number', description: 'Baud rate (default: 921600)' },
                            flashOptions: {
                                type: 'object',
                                properties: {
                                    flashMode: { type: 'string', enum: ['qio', 'qout', 'dio', 'dout'] },
                                    flashFreq: { type: 'string', enum: ['40m', '26m', '20m', '80m'] },
                                    flashSize: { type: 'string' },
                                    verify: { type: 'boolean' },
                                    eraseAll: { type: 'boolean' },
                                },
                            },
                        },
                        required: ['port', 'boardId', 'binaryPath'],
                    },
                },
                {
                    name: 'monitor',
                    description: 'Read serial monitor output from board',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            port: { type: 'string', description: 'Serial port' },
                            baudRate: { type: 'number', description: 'Baud rate (default: 115200)' },
                            duration: { type: 'number', description: 'Monitor duration in ms (default: 5000)' },
                            filter: { type: 'string', description: 'Regex filter for output' },
                        },
                        required: ['port'],
                    },
                },
                {
                    name: 'platformio_build',
                    description: 'Build project using PlatformIO',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            projectPath: { type: 'string', description: 'Path to PlatformIO project' },
                            environment: { type: 'string', description: 'Build environment (default: default)' },
                            clean: { type: 'boolean' },
                            upload: { type: 'boolean' },
                            uploadPort: { type: 'string' },
                        },
                        required: ['projectPath'],
                    },
                },
                {
                    name: 'platformio_upload',
                    description: 'Upload firmware using PlatformIO',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            projectPath: { type: 'string', description: 'Path to PlatformIO project' },
                            environment: { type: 'string', description: 'Upload environment' },
                            port: { type: 'string', description: 'Upload port' },
                        },
                        required: ['projectPath'],
                    },
                },
            ],
        }));
        // Call tool
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'detect_board':
                        return await this.handleDetectBoard(args);
                    case 'list_boards':
                        return await this.handleListBoards(args);
                    case 'get_board_info':
                        return await this.handleGetBoardInfo(args);
                    case 'compile':
                        return await this.handleCompile(args);
                    case 'upload':
                        return await this.handleUpload(args);
                    case 'flash':
                        return await this.handleFlash(args);
                    case 'monitor':
                        return await this.handleMonitor(args);
                    case 'platformio_build':
                        return await this.handlePlatformIOBuild(args);
                    case 'platformio_upload':
                        return await this.handlePlatformIOUpload(args);
                    default:
                        throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            }
            catch (error) {
                this.logger.error({ tool: name, error }, 'Tool execution failed');
                return {
                    content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
                    isError: true,
                };
            }
        });
        // List resources
        this.server.setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => ({
            resources: [
                {
                    uri: 'board://database',
                    name: 'Board Database',
                    description: 'Complete board database with all supported boards',
                    mimeType: 'application/json',
                },
                {
                    uri: 'board://detected',
                    name: 'Detected Devices',
                    description: 'Currently detected hardware devices',
                    mimeType: 'application/json',
                },
            ],
        }));
        // Read resource
        this.server.setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
            const { uri } = request.params;
            if (uri === 'board://database') {
                const boards = this.boardDatabase.getAllBoards().map(b => ({
                    id: b.id,
                    name: b.name,
                    type: b.type,
                    vendor: b.vendor,
                    fqbn: b.variants[0]?.fqbn ?? '',
                    platformioBoard: b.platformioBoard ?? '',
                    esptoolChip: b.esptoolChip ?? '',
                }));
                return {
                    contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ boards }, null, 2) }],
                };
            }
            if (uri === 'board://detected') {
                const devices = this.hardwareDetector.getDevices();
                return {
                    contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ devices }, null, 2) }],
                };
            }
            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
        });
    }
    /**
     * Initialize all modules
     */
    async initialize() {
        if (this.initialized)
            return;
        // Pass dummy core object since Module interface expects it
        const dummyCore = {};
        await this.hardwareDetector.initialize(dummyCore);
        await this.hardwareDetector.start();
        await this.serialManager.initialize(dummyCore);
        await this.serialManager.start();
        await this.arduinoManager.initialize(dummyCore);
        await this.arduinoManager.start();
        await this.espManager.initialize(dummyCore);
        await this.espManager.start();
        await this.platformioManager.initialize(dummyCore);
        await this.platformioManager.start();
        this.initialized = true;
        this.logger.info('MCP server initialized');
    }
    /**
     * Start the MCP server
     */
    async start() {
        await this.initialize();
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        this.logger.info('MCP server started on stdio');
    }
    /**
     * Stop the MCP server
     */
    async stop() {
        await this.hardwareDetector.stop();
        await this.serialManager.stop();
        await this.arduinoManager.stop();
        await this.espManager.stop();
        await this.platformioManager.stop();
        await this.server.close();
        this.logger.info('MCP server stopped');
    }
    // Tool handlers
    async handleDetectBoard(input) {
        const { port, vid, pid } = input;
        if (!port) {
            // Scan all ports
            const result = await this.hardwareDetector.triggerScan();
            const detected = result.devices.filter(d => d.boardDetection);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            devices: detected.map(d => ({
                                port: d.port,
                                board: d.boardDetection?.board.name,
                                variant: d.boardDetection?.variant.name,
                                confidence: d.boardDetection?.confidence,
                                detectionMethod: d.boardDetection?.detectionMethod,
                            })),
                        }, null, 2),
                    },
                ],
            };
        }
        const detection = this.boardDatabase.detectBoard(port, vid, pid);
        if (!detection) {
            return {
                content: [{ type: 'text', text: `No board detected on port ${port}` }],
                isError: true,
            };
        }
        const output = {
            board: detection.board,
            variant: detection.variant,
            port: detection.port,
            confidence: detection.confidence,
            detectionMethod: detection.detectionMethod,
        };
        return {
            content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
        };
    }
    async handleListBoards(input) {
        let boards = this.boardDatabase.getAllBoards();
        if (input.type) {
            boards = boards.filter(b => b.type === input.type);
        }
        if (input.search) {
            const search = input.search.toLowerCase();
            boards = boards.filter(b => b.name.toLowerCase().includes(search) ||
                b.vendor.toLowerCase().includes(search) ||
                b.id.toLowerCase().includes(search));
        }
        const output = {
            boards: boards.map(b => ({
                id: b.id,
                name: b.name,
                type: b.type,
                vendor: b.vendor,
                fqbn: b.variants[0]?.fqbn ?? '',
                platformioBoard: b.platformioBoard ?? '',
                esptoolChip: b.esptoolChip ?? '',
            })),
        };
        return {
            content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
        };
    }
    async handleGetBoardInfo(input) {
        const { boardId } = input;
        const board = this.boardDatabase.getBoard(boardId);
        if (!board) {
            return {
                content: [{ type: 'text', text: `Board not found: ${boardId}` }],
                isError: true,
            };
        }
        const defaultVariant = this.boardDatabase.getDefaultVariant(boardId);
        const output = {
            board,
            variants: board.variants,
            defaultVariant: defaultVariant,
        };
        return {
            content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
        };
    }
    async handleCompile(input) {
        const { sketchPath, boardId, variantId, fqbn, buildOptions } = input;
        const targetFqbn = fqbn || this.boardDatabase.getFqbn(boardId, variantId);
        if (!targetFqbn) {
            return {
                content: [{ type: 'text', text: `No FQBN found for board ${boardId}` }],
                isError: true,
            };
        }
        const result = await this.arduinoManager.compile({
            sketchPath,
            fqbn: targetFqbn,
            buildOptions: buildOptions ? {
                ...buildOptions,
                optimization: buildOptions.optimization,
                warnings: buildOptions.warnings,
            } : undefined,
        });
        const output = {
            success: result.success,
            binaryPath: result.binaryPath ?? '',
            output: result.output,
            error: result.error ?? '',
            duration: result.duration,
        };
        return {
            content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
            isError: !result.success,
        };
    }
    async handleUpload(input) {
        const { sketchPath, boardId, variantId, port, fqbn, uploadOptions } = input;
        const targetFqbn = fqbn || this.boardDatabase.getFqbn(boardId, variantId);
        if (!targetFqbn) {
            return {
                content: [{ type: 'text', text: `No FQBN found for board ${boardId}` }],
                isError: true,
            };
        }
        const result = await this.arduinoManager.upload({
            sketchPath,
            fqbn: targetFqbn,
            uploadOptions: {
                port,
                verify: uploadOptions?.verify,
                protocol: uploadOptions?.protocol,
                baudRate: uploadOptions?.baudRate,
                resetMethod: uploadOptions?.resetMethod,
            },
        });
        const output = {
            success: result.success,
            output: result.output,
            error: result.error ?? '',
            duration: result.duration,
            verified: result.verified ?? false,
        };
        return {
            content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
            isError: !result.success,
        };
    }
    async handleFlash(input) {
        const { port, boardId, binaryPath, address, baudRate, flashOptions } = input;
        const chip = this.boardDatabase.getEsptoolChip(boardId);
        if (!chip) {
            return {
                content: [{ type: 'text', text: `No esptool chip found for board ${boardId}` }],
                isError: true,
            };
        }
        // Build flash options conditionally to satisfy exactOptionalPropertyTypes
        const flashOpts = {
            port,
            binaryPath,
            address: address || '0x0',
            baudRate: baudRate || 921600,
            chip,
            verify: flashOptions?.verify !== false,
        };
        if (flashOptions?.flashMode)
            flashOpts.flashMode = flashOptions.flashMode;
        if (flashOptions?.flashFreq)
            flashOpts.flashFreq = flashOptions.flashFreq;
        if (flashOptions?.flashSize)
            flashOpts.flashSize = flashOptions.flashSize;
        if (flashOptions?.eraseAll)
            flashOpts.eraseAll = flashOptions.eraseAll;
        const result = await this.espManager.flash(flashOpts);
        const output = {
            success: result.success,
            output: result.output,
            error: result.error ?? '',
            duration: result.duration,
            verified: result.verified ?? false,
        };
        return {
            content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
            isError: !result.success,
        };
    }
    async handleMonitor(input) {
        const { port, baudRate, duration, filter } = input;
        // Open port if not already open
        if (!this.serialManager.isConnected(port)) {
            await this.serialManager.openPort(port, { baudRate: baudRate || 115200 });
        }
        // Start monitoring
        this.serialManager.startMonitoring({
            port,
            baudRate: baudRate || 115200,
            timestamps: true,
            showDirection: true,
            filter,
            maxBufferSize: 65536,
            encoding: 'utf8',
        });
        // Wait for duration
        await new Promise(resolve => setTimeout(resolve, duration || 5000));
        // Get buffer
        const buffer = this.serialManager.getMonitorBuffer(port);
        this.serialManager.stopMonitoring(port);
        let output = buffer.map(chunk => typeof chunk.data === 'string' ? chunk.data : chunk.data.toString('utf8')).join('');
        if (filter) {
            const regex = new RegExp(filter);
            output = output.split('\n').filter(line => regex.test(line)).join('\n');
        }
        const result = {
            output: output.slice(-10000), // Limit output size
            truncated: output.length > 10000,
        };
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
    async handlePlatformIOBuild(input) {
        const { projectPath, environment, clean, upload, uploadPort } = input;
        const result = await this.platformioManager.build(projectPath, {
            environment: environment,
            clean: clean,
            upload: upload,
            uploadPort: uploadPort,
        });
        return {
            content: [{ type: 'text', text: JSON.stringify({
                        success: result.success,
                        output: result.output,
                        error: result.error ?? '',
                        duration: result.duration,
                        firmwarePath: result.firmwarePath ?? '',
                    }, null, 2) }],
            isError: !result.success,
        };
    }
    async handlePlatformIOUpload(input) {
        const { projectPath, environment, port } = input;
        const result = await this.platformioManager.upload(projectPath, {
            environment: environment,
            port: port,
        });
        return {
            content: [{ type: 'text', text: JSON.stringify({
                        success: result.success,
                        output: result.output,
                        error: result.error ?? '',
                        duration: result.duration,
                    }, null, 2) }],
            isError: !result.success,
        };
    }
}
exports.BoardMCPServer = BoardMCPServer;
/**
 * Create MCP server instance
 */
function createMCPServer(config, logger) {
    return new BoardMCPServer(config, logger);
}
//# sourceMappingURL=mcp-server.js.map