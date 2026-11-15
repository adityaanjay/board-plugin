/**
 * CLI Installer tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { program } from '../cli.js';

describe('CLI Installer', () => {
  it('should have the program export', () => {
    expect(program).toBeDefined();
    expect(program.name()).toBe('board-cli');
    expect(program.description()).toBe('Board Plugin CLI - Install and configure Board Plugin for AI agents');
    expect(program.version()).toBe('0.1.0');
  });

  it('should have install command structure', () => {
    const installCmd = program.commands.find(c => c.name() === 'install');
    expect(installCmd).toBeDefined();
    expect(installCmd?.description()).toBe('Install Board Plugin for AI agents');
    expect(installCmd?.options.some(o => o.long === '--claude-code')).toBe(true);
    expect(installCmd?.options.some(o => o.long === '--opencode')).toBe(true);
    expect(installCmd?.options.some(o => o.long === '--all')).toBe(true);
    expect(installCmd?.options.some(o => o.long === '--dry-run')).toBe(true);
  });

  it('should have uninstall command structure', () => {
    const uninstallCmd = program.commands.find(c => c.name() === 'uninstall');
    expect(uninstallCmd).toBeDefined();
    expect(uninstallCmd?.description()).toBe('Uninstall Board Plugin from AI agents');
    expect(uninstallCmd?.options.some(o => o.long === '--claude-code')).toBe(true);
    expect(uninstallCmd?.options.some(o => o.long === '--opencode')).toBe(true);
    expect(uninstallCmd?.options.some(o => o.long === '--all')).toBe(true);
  });

  it('should have status command structure', () => {
    const statusCmd = program.commands.find(c => c.name() === 'status');
    expect(statusCmd).toBeDefined();
    expect(statusCmd?.description()).toBe('Check installation status');
  });

  it('should have serve command structure', () => {
    const serveCmd = program.commands.find(c => c.name() === 'serve');
    expect(serveCmd).toBeDefined();
    expect(serveCmd?.description()).toBe('Run the MCP server (for testing)');
    expect(serveCmd?.options.some(o => o.long === '--name')).toBe(true);
    expect(serveCmd?.options.some(o => o.long === '--version')).toBe(true);
  });
});