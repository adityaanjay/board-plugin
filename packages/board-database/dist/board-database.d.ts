/**
 * Board Database Module
 * Provides access to board definitions and search capabilities
 */
import { EventEmitter } from 'eventemitter3';
import { Logger } from 'pino';
import type { BoardDefinition, BoardVariant, BoardType, BoardSearchResult, BoardDetectionResult, BoardDatabaseConfig } from './types.js';
export declare class BoardDatabase extends EventEmitter {
    private boards;
    private readonly logger;
    private initialized;
    constructor(_config?: Partial<BoardDatabaseConfig>, logger?: Logger);
    /**
     * Load built-in board definitions
     */
    private loadBuiltinBoards;
    /**
     * Load user-defined boards from a file
     */
    loadUserBoards(path: string): Promise<void>;
    /**
     * Get a board definition by ID
     */
    getBoard(id: string): BoardDefinition | undefined;
    /**
     * Get board by type
     */
    getBoardsByType(type: BoardType): BoardDefinition[];
    /**
     * Find boards by VID/PID
     */
    findByVidPid(vid: string, pid: string): BoardDefinition[];
    /**
     * Get all board definitions
     */
    getAllBoards(): BoardDefinition[];
    /**
     * Get board variants
     */
    getVariants(boardId: string): BoardVariant[];
    /**
     * Get default variant for a board
     */
    getDefaultVariant(boardId: string): BoardVariant | undefined;
    /**
     * Get a specific variant
     */
    getVariant(boardId: string, variantId: string): BoardVariant | undefined;
    /**
     * Search boards by query string
     */
    search(query: string): BoardSearchResult[];
    /**
     * Detect board from port info
     */
    detectBoard(port: string, vid?: string, pid?: string): BoardDetectionResult | null;
    /**
     * Heuristic board detection based on port name
     */
    private heuristicDetect;
    /**
     * Get board FQBN for Arduino CLI
     */
    getFqbn(boardId: string, variantId?: string): string | undefined;
    /**
     * Get PlatformIO board ID
     */
    getPlatformIOBoard(boardId: string): string | undefined;
    /**
     * Get esptool chip name
     */
    getEsptoolChip(boardId: string): string | undefined;
    /**
     * Get board capabilities
     */
    getCapabilities(boardId: string, variantId?: string): BoardDefinition['capabilities'] | undefined;
    /**
     * Check if board supports a feature
     */
    supportsFeature(boardId: string, feature: keyof BoardDefinition['capabilities']): boolean;
    /**
     * Register a custom board definition
     */
    registerBoard(board: BoardDefinition): void;
    /**
     * Unregister a board
     */
    unregisterBoard(id: string): boolean;
    /**
     * Get board count
     */
    size(): number;
    /**
     * Get all board IDs
     */
    getBoardIds(): string[];
    /**
     * Get all board types
     */
    getBoardTypes(): BoardType[];
    /**
     * Export board definitions to JSON
     */
    toJSON(): BoardDefinition[];
    /**
     * Check if initialized
     */
    isInitialized(): boolean;
}
/**
 * Create a board database instance
 */
export declare function createBoardDatabase(config?: Partial<BoardDatabaseConfig>, logger?: Logger): BoardDatabase;
//# sourceMappingURL=board-database.d.ts.map