/**
 * Board Definitions Database
 * Comprehensive definitions for all supported boards
 */
import { BoardType } from '../types.js';
import type { BoardDefinition, BoardVariant } from '../types.js';
export declare const BOARD_DEFINITIONS: BoardDefinition[];
/**
 * Get board definition by ID
 */
export declare function getBoardById(id: string): BoardDefinition | undefined;
/**
 * Get board definition by type
 */
export declare function getBoardsByType(type: BoardType): BoardDefinition[];
/**
 * Find board by VID/PID
 */
export declare function findByVidPid(vid: string, pid: string): BoardDefinition[];
/**
 * Get all board definitions
 */
export declare function getAllBoards(): BoardDefinition[];
/**
 * Get board variants
 */
export declare function getBoardVariants(boardId: string): BoardVariant[];
/**
 * Get default variant for a board
 */
export declare function getDefaultVariant(boardId: string): BoardVariant | undefined;
//# sourceMappingURL=boards.d.ts.map