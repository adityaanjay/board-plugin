/**
 * MCP Server for Board Plugin
 * Provides AI agent tools for hardware programming and debugging
 */
import { Logger } from 'pino';
import type { MCPServerConfig } from './types.js';
/**
 * MCP Server class
 */
export declare class BoardMCPServer {
    private server;
    private logger;
    private boardDatabase;
    private hardwareDetector;
    private serialManager;
    private arduinoManager;
    private espManager;
    private platformioManager;
    private initialized;
    constructor(config?: Partial<MCPServerConfig>, logger?: Logger);
    /**
     * Setup MCP request handlers
     */
    private setupHandlers;
    /**
     * Initialize all modules
     */
    initialize(): Promise<void>;
    /**
     * Start the MCP server
     */
    start(): Promise<void>;
    /**
     * Stop the MCP server
     */
    stop(): Promise<void>;
    private handleDetectBoard;
    private handleListBoards;
    private handleGetBoardInfo;
    private handleCompile;
    private handleUpload;
    private handleFlash;
    private handleMonitor;
    private handlePlatformIOBuild;
    private handlePlatformIOUpload;
}
/**
 * Create MCP server instance
 */
export declare function createMCPServer(config?: Partial<MCPServerConfig>, logger?: Logger): BoardMCPServer;
//# sourceMappingURL=mcp-server.d.ts.map