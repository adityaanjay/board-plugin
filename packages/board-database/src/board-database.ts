/**
 * Board Database Module
 * Provides access to board definitions and search capabilities
 */

import { EventEmitter } from 'eventemitter3';
import pino, { Logger } from 'pino';
import type { BoardDefinition, BoardVariant, BoardType, BoardSearchResult, BoardDetectionResult, BoardDatabaseConfig } from './types.js';
import { BOARD_DEFINITIONS } from './data/boards.js';

export class BoardDatabase extends EventEmitter {
  private boards: Map<string, BoardDefinition> = new Map();
  private readonly logger: Logger;
  private initialized = false;

  constructor(_config: Partial<BoardDatabaseConfig> = {}, logger?: Logger) {
    super();
    this.logger = logger || pino({ level: 'info' });
    this.loadBuiltinBoards();
  }

  /**
   * Load built-in board definitions
   */
  private loadBuiltinBoards(): void {
    for (const board of BOARD_DEFINITIONS) {
      this.boards.set(board.id, board);
    }
    this.initialized = true;
    this.logger.debug({ count: this.boards.size }, 'Loaded built-in board definitions');
  }

  /**
   * Load user-defined boards from a file
   */
  async loadUserBoards(path: string): Promise<void> {
    try {
      const module = await import(path);
      if (module.BOARD_DEFINITIONS && Array.isArray(module.BOARD_DEFINITIONS)) {
        for (const board of module.BOARD_DEFINITIONS) {
          this.boards.set(board.id, board);
        }
        this.logger.info({ count: module.BOARD_DEFINITIONS.length, path }, 'Loaded user board definitions');
      }
    } catch (error) {
      this.logger.warn({ path, error }, 'Failed to load user boards');
    }
  }

  /**
   * Get a board definition by ID
   */
  getBoard(id: string): BoardDefinition | undefined {
    return this.boards.get(id);
  }

  /**
   * Get board by type
   */
  getBoardsByType(type: BoardType): BoardDefinition[] {
    return Array.from(this.boards.values()).filter(b => b.type === type);
  }

  /**
   * Find boards by VID/PID
   */
  findByVidPid(vid: string, pid: string): BoardDefinition[] {
    return Array.from(this.boards.values()).filter(b =>
      b.vidPids.some(vp =>
        vp.vid.toLowerCase() === vid.toLowerCase() &&
        vp.pid.toLowerCase() === pid.toLowerCase()
      )
    );
  }

  /**
   * Get all board definitions
   */
  getAllBoards(): BoardDefinition[] {
    return Array.from(this.boards.values());
  }

  /**
   * Get board variants
   */
  getVariants(boardId: string): BoardVariant[] {
    const board = this.boards.get(boardId);
    return board?.variants || [];
  }

  /**
   * Get default variant for a board
   */
  getDefaultVariant(boardId: string): BoardVariant | undefined {
    const board = this.boards.get(boardId);
    if (!board) return undefined;
    return board.variants.find(v => v.id === board.defaultVariant);
  }

  /**
   * Get a specific variant
   */
  getVariant(boardId: string, variantId: string): BoardVariant | undefined {
    const board = this.boards.get(boardId);
    if (!board) return undefined;
    return board.variants.find(v => v.id === variantId);
  }

  /**
   * Search boards by query string
   */
  search(query: string): BoardSearchResult[] {
    const lowerQuery = query.toLowerCase();
    const results: BoardSearchResult[] = [];

    for (const board of this.boards.values()) {
      let confidence = 0;
      let matchType: BoardSearchResult['matchType'] = 'fuzzy';

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
  detectBoard(port: string, vid?: string, pid?: string): BoardDetectionResult | null {
    // Try VID/PID match first
    if (vid && pid) {
      const matches = this.findByVidPid(vid, pid);
      if (matches.length === 1) {
        const board = matches[0]!; // length checked above
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
      } else if (matches.length > 1) {
        // Multiple matches - return first with medium confidence
        const board = matches[0]!; // length checked above
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
      const board = heuristicBoards[0]!; // length checked above
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
  private heuristicDetect(port: string): BoardDefinition[] {
    const lowerPort = port.toLowerCase();
    const results: BoardDefinition[] = [];

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
  getFqbn(boardId: string, variantId?: string): string | undefined {
    const board = this.boards.get(boardId);
    if (!board) return undefined;

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
  getPlatformIOBoard(boardId: string): string | undefined {
    const board = this.boards.get(boardId);
    return board?.platformioBoard;
  }

  /**
   * Get esptool chip name
   */
  getEsptoolChip(boardId: string): string | undefined {
    const board = this.boards.get(boardId);
    return board?.esptoolChip;
  }

  /**
   * Get board capabilities
   */
  getCapabilities(boardId: string, variantId?: string): BoardDefinition['capabilities'] | undefined {
    const board = this.boards.get(boardId);
    if (!board) return undefined;

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
  supportsFeature(boardId: string, feature: keyof BoardDefinition['capabilities']): boolean {
    const caps = this.getCapabilities(boardId);
    if (!caps) return false;
    return caps[feature] === true || (typeof caps[feature] === 'number' && caps[feature] > 0);
  }

  /**
   * Register a custom board definition
   */
  registerBoard(board: BoardDefinition): void {
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
  unregisterBoard(id: string): boolean {
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
  size(): number {
    return this.boards.size;
  }

  /**
   * Get all board IDs
   */
  getBoardIds(): string[] {
    return Array.from(this.boards.keys());
  }

  /**
   * Get all board types
   */
  getBoardTypes(): BoardType[] {
    const types = new Set<BoardType>();
    for (const board of this.boards.values()) {
      types.add(board.type);
    }
    return Array.from(types);
  }

  /**
   * Export board definitions to JSON
   */
  toJSON(): BoardDefinition[] {
    return Array.from(this.boards.values());
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Create a board database instance
 */
export function createBoardDatabase(config?: Partial<BoardDatabaseConfig>, logger?: Logger): BoardDatabase {
  return new BoardDatabase(config, logger);
}