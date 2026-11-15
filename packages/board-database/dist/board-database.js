"use strict";
/**
 * Board Database Module
 * Provides access to board definitions and search capabilities
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardDatabase = void 0;
exports.createBoardDatabase = createBoardDatabase;
const eventemitter3_1 = require("eventemitter3");
const pino_1 = __importDefault(require("pino"));
const boards_js_1 = require("./data/boards.js");
class BoardDatabase extends eventemitter3_1.EventEmitter {
    boards = new Map();
    logger;
    initialized = false;
    constructor(_config = {}, logger) {
        super();
        this.logger = logger || (0, pino_1.default)({ level: 'info' });
        this.loadBuiltinBoards();
    }
    /**
     * Load built-in board definitions
     */
    loadBuiltinBoards() {
        for (const board of boards_js_1.BOARD_DEFINITIONS) {
            this.boards.set(board.id, board);
        }
        this.initialized = true;
        this.logger.debug({ count: this.boards.size }, 'Loaded built-in board definitions');
    }
    /**
     * Load user-defined boards from a file
     */
    async loadUserBoards(path) {
        try {
            const module = await import(path);
            if (module.BOARD_DEFINITIONS && Array.isArray(module.BOARD_DEFINITIONS)) {
                for (const board of module.BOARD_DEFINITIONS) {
                    this.boards.set(board.id, board);
                }
                this.logger.info({ count: module.BOARD_DEFINITIONS.length, path }, 'Loaded user board definitions');
            }
        }
        catch (error) {
            this.logger.warn({ path, error }, 'Failed to load user boards');
        }
    }
    /**
     * Get a board definition by ID
     */
    getBoard(id) {
        return this.boards.get(id);
    }
    /**
     * Get board by type
     */
    getBoardsByType(type) {
        return Array.from(this.boards.values()).filter(b => b.type === type);
    }
    /**
     * Find boards by VID/PID
     */
    findByVidPid(vid, pid) {
        return Array.from(this.boards.values()).filter(b => b.vidPids.some(vp => vp.vid.toLowerCase() === vid.toLowerCase() &&
            vp.pid.toLowerCase() === pid.toLowerCase()));
    }
    /**
     * Get all board definitions
     */
    getAllBoards() {
        return Array.from(this.boards.values());
    }
    /**
     * Get board variants
     */
    getVariants(boardId) {
        const board = this.boards.get(boardId);
        return board?.variants || [];
    }
    /**
     * Get default variant for a board
     */
    getDefaultVariant(boardId) {
        const board = this.boards.get(boardId);
        if (!board)
            return undefined;
        return board.variants.find(v => v.id === board.defaultVariant);
    }
    /**
     * Get a specific variant
     */
    getVariant(boardId, variantId) {
        const board = this.boards.get(boardId);
        if (!board)
            return undefined;
        return board.variants.find(v => v.id === variantId);
    }
    /**
     * Search boards by query string
     */
    search(query) {
        const lowerQuery = query.toLowerCase();
        const results = [];
        for (const board of this.boards.values()) {
            let confidence = 0;
            let matchType = 'fuzzy';
            // Exact ID match
            if (board.id.toLowerCase() === lowerQuery) {
                confidence = 1.0;
                matchType = 'exact';
            }
            // Name match
            else if (board.name.toLowerCase().includes(lowerQuery)) {
                confidence = 0.8;
                matchType = 'fuzzy';
            }
            // Type match
            else if (board.type.toString().toLowerCase().includes(lowerQuery)) {
                confidence = 0.6;
                matchType = 'fuzzy';
            }
            // Tag match
            else if (board.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
                confidence = 0.5;
                matchType = 'fuzzy';
            }
            // MCU match
            else if (board.mcu.toLowerCase().includes(lowerQuery)) {
                confidence = 0.5;
                matchType = 'fuzzy';
            }
            if (confidence > 0) {
                results.push({ board, matchType, confidence });
            }
        }
        // Sort by confidence descending
        return results.sort((a, b) => b.confidence - a.confidence);
    }
    /**
     * Detect board from port info
     */
    detectBoard(port, vid, pid) {
        // Try VID/PID match first
        if (vid && pid) {
            const matches = this.findByVidPid(vid, pid);
            if (matches.length === 1) {
                const board = matches[0]; // length checked above
                const variant = this.getDefaultVariant(board.id);
                if (variant) {
                    return {
                        board,
                        variant,
                        port,
                        vidPid: { vid, pid },
                        confidence: 'high',
                        detectionMethod: 'vidpid',
                    };
                }
            }
            else if (matches.length > 1) {
                // Multiple matches - return first with medium confidence
                const board = matches[0]; // length checked above
                const variant = this.getDefaultVariant(board.id);
                if (variant) {
                    return {
                        board,
                        variant,
                        port,
                        vidPid: { vid, pid },
                        confidence: 'medium',
                        detectionMethod: 'vidpid',
                    };
                }
            }
        }
        // Heuristic: try to match by port name
        const heuristicBoards = this.heuristicDetect(port);
        if (heuristicBoards.length > 0) {
            const board = heuristicBoards[0]; // length checked above
            const variant = this.getDefaultVariant(board.id);
            if (variant) {
                return {
                    board,
                    variant,
                    port,
                    confidence: 'low',
                    detectionMethod: 'heuristic',
                };
            }
        }
        return null;
    }
    /**
     * Heuristic board detection based on port name
     */
    heuristicDetect(port) {
        const lowerPort = port.toLowerCase();
        const results = [];
        for (const board of this.boards.values()) {
            // Check if any variant name appears in port
            for (const variant of board.variants) {
                if (lowerPort.includes(variant.id.toLowerCase()) ||
                    lowerPort.includes(variant.name.toLowerCase())) {
                    results.push(board);
                    break;
                }
            }
        }
        return results;
    }
    /**
     * Get board FQBN for Arduino CLI
     */
    getFqbn(boardId, variantId) {
        const board = this.boards.get(boardId);
        if (!board)
            return undefined;
        if (variantId) {
            const variant = board.variants.find(v => v.id === variantId);
            return variant?.fqbn;
        }
        const defaultVariant = this.getDefaultVariant(boardId);
        return defaultVariant?.fqbn;
    }
    /**
     * Get PlatformIO board ID
     */
    getPlatformIOBoard(boardId) {
        const board = this.boards.get(boardId);
        return board?.platformioBoard;
    }
    /**
     * Get esptool chip name
     */
    getEsptoolChip(boardId) {
        const board = this.boards.get(boardId);
        return board?.esptoolChip;
    }
    /**
     * Get board capabilities
     */
    getCapabilities(boardId, variantId) {
        const board = this.boards.get(boardId);
        if (!board)
            return undefined;
        if (variantId) {
            const variant = board.variants.find(v => v.id === variantId);
            if (variant?.capabilities) {
                return { ...board.capabilities, ...variant.capabilities };
            }
        }
        return board.capabilities;
    }
    /**
     * Check if board supports a feature
     */
    supportsFeature(boardId, feature) {
        const caps = this.getCapabilities(boardId);
        if (!caps)
            return false;
        return caps[feature] === true || (typeof caps[feature] === 'number' && caps[feature] > 0);
    }
    /**
     * Register a custom board definition
     */
    registerBoard(board) {
        if (this.boards.has(board.id)) {
            throw new Error(`Board with ID ${board.id} already exists`);
        }
        this.boards.set(board.id, board);
        this.emit('board:registered', board);
        this.logger.info({ id: board.id }, 'Custom board registered');
    }
    /**
     * Unregister a board
     */
    unregisterBoard(id) {
        const result = this.boards.delete(id);
        if (result) {
            this.emit('board:unregistered', id);
            this.logger.info({ id }, 'Board unregistered');
        }
        return result;
    }
    /**
     * Get board count
     */
    size() {
        return this.boards.size;
    }
    /**
     * Get all board IDs
     */
    getBoardIds() {
        return Array.from(this.boards.keys());
    }
    /**
     * Get all board types
     */
    getBoardTypes() {
        const types = new Set();
        for (const board of this.boards.values()) {
            types.add(board.type);
        }
        return Array.from(types);
    }
    /**
     * Export board definitions to JSON
     */
    toJSON() {
        return Array.from(this.boards.values());
    }
    /**
     * Check if initialized
     */
    isInitialized() {
        return this.initialized;
    }
}
exports.BoardDatabase = BoardDatabase;
/**
 * Create a board database instance
 */
function createBoardDatabase(config, logger) {
    return new BoardDatabase(config, logger);
}
//# sourceMappingURL=board-database.js.map