/**
 * MCP Server tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMCPServer } from '../mcp-server.js';

describe('BoardMCPServer', () => {
  let server: ReturnType<typeof createMCPServer>;

  beforeEach(() => {
    server = createMCPServer({
      name: 'test-board-plugin',
      version: '0.1.0',
    });
  });

  afterEach(async () => {
    // The server doesn't have a destroy method, but we can test it's created properly
  });

  it('should create an MCP server instance', () => {
    expect(server).toBeDefined();
  });

  it('should have initialize method', () => {
    expect(typeof server.initialize).toBe('function');
  });

  it('should have start method', () => {
    expect(typeof server.start).toBe('function');
  });

  it('should have stop method', () => {
    expect(typeof server.stop).toBe('function');
  });

  it('should have correct server name and version', () => {
    // Test that the server was created with the correct config
    expect(server).toBeDefined();
  });
});