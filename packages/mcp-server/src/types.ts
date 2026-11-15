/**
 * MCP Server type definitions
 */

import type { BoardDefinition, BoardVariant } from '@board/board-database';

/**
 * MCP Tool result
 */
export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Detect board tool input
 */
export interface DetectBoardInput {
  port?: string;
  vid?: string;
  pid?: string;
}

/**
 * Detect board tool output
 */
export interface DetectBoardOutput {
  board?: BoardDefinition;
  variant?: BoardVariant;
  port: string;
  confidence: 'high' | 'medium' | 'low';
  detectionMethod: 'vidpid' | 'bootloader' | 'heuristic';
}

/**
 * List boards tool input
 */
export interface ListBoardsInput {
  type?: string;
  search?: string;
}

/**
 * List boards tool output
 */
export interface ListBoardsOutput {
  boards: Array<{
    id: string;
    name: string;
    type: string;
    vendor: string;
    fqbn?: string;
    platformioBoard?: string;
    esptoolChip?: string;
  }>;
}

/**
 * Compile tool input
 */
export interface CompileInput {
  sketchPath: string;
  boardId: string;
  variantId?: string;
  fqbn?: string;
  buildOptions?: {
    optimization?: 'debug' | 'release' | 'size' | 'fast';
    warnings?: 'none' | 'default' | 'more' | 'all';
    verbose?: boolean;
    clean?: boolean;
  };
}

/**
 * Compile tool output
 */
export interface CompileOutput {
  success: boolean;
  binaryPath?: string;
  output: string;
  error?: string;
  duration: number;
}

/**
 * Upload tool input
 */
export interface UploadInput {
  sketchPath: string;
  boardId: string;
  variantId?: string;
  port?: string;
  fqbn?: string;
  uploadOptions?: {
    verify?: boolean;
    protocol?: string;
    baudRate?: number;
    resetMethod?: 'dtr' | 'rts' | 'dsr' | 'none';
  };
}

/**
 * Upload tool output
 */
export interface UploadOutput {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
  verified?: boolean;
}

/**
 * Flash tool input (for ESP boards)
 */
export interface FlashInput {
  port: string;
  boardId: string;
  binaryPath: string;
  address?: string;
  baudRate?: number;
  flashOptions?: {
    flashMode?: 'qio' | 'qout' | 'dio' | 'dout';
    flashFreq?: '40m' | '26m' | '20m' | '80m';
    flashSize?: string;
    verify?: boolean;
    eraseAll?: boolean;
  };
}

/**
 * Flash tool output
 */
export interface FlashOutput {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
  verified?: boolean;
}

/**
 * Monitor tool input
 */
export interface MonitorInput {
  port: string;
  baudRate?: number;
  duration?: number;
  filter?: string;
}

/**
 * Monitor tool output
 */
export interface MonitorOutput {
  output: string;
  truncated: boolean;
}

/**
 * Board info tool input
 */
export interface BoardInfoInput {
  boardId: string;
}

/**
 * Board info tool output
 */
export interface BoardInfoOutput {
  board: BoardDefinition;
  variants: BoardVariant[];
  defaultVariant: BoardVariant;
}

/**
 * MCP Server configuration
 */
export interface MCPServerConfig {
  name: string;
  version: string;
  capabilities: {
    tools: boolean;
    resources: boolean;
    prompts: boolean;
  };
}