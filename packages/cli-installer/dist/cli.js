#!/usr/bin/env node
"use strict";
/**
 * Board Plugin CLI Installer
 * Install and configure Board Plugin for AI agents (Claude Code, OpenCode)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.program = void 0;
const commander_1 = require("commander");
const mcp_server_1 = require("@board/mcp-server");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)({ level: 'info' });
const program = new commander_1.Command();
exports.program = program;
program
    .name('board-cli')
    .description('Board Plugin CLI - Install and configure Board Plugin for AI agents')
    .version('0.1.0')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-c, --config <path>', 'Config file path');
// Install command
program
    .command('install')
    .description('Install Board Plugin for AI agents')
    .option('--claude-code', 'Install for Claude Code (MCP server)')
    .option('--opencode', 'Install for OpenCode')
    .option('--all', 'Install for all supported AI agents')
    .option('--dry-run', 'Show what would be installed without making changes')
    .action(async (options) => {
    try {
        if (options.verbose) {
            logger.level = 'debug';
        }
        logger.info('Board Plugin CLI Installer');
        logger.info('============================');
        const targets = [];
        if (options.claudeCode || options.all)
            targets.push('claude-code');
        if (options.opencode || options.all)
            targets.push('opencode');
        if (targets.length === 0) {
            logger.warn('No installation target specified. Use --claude-code, --opencode, or --all');
            process.exit(1);
        }
        logger.info({ targets }, 'Installing for targets');
        for (const target of targets) {
            if (target === 'claude-code') {
                await installForClaudeCode(options.dryRun);
            }
            else if (target === 'opencode') {
                await installForOpenCode(options.dryRun);
            }
        }
        logger.info('Installation complete!');
    }
    catch (error) {
        logger.error({ error }, 'Installation failed');
        process.exit(1);
    }
});
// Uninstall command
program
    .command('uninstall')
    .description('Uninstall Board Plugin from AI agents')
    .option('--claude-code', 'Uninstall from Claude Code')
    .option('--opencode', 'Uninstall from OpenCode')
    .option('--all', 'Uninstall from all AI agents')
    .action(async (options) => {
    try {
        logger.info('Uninstalling Board Plugin...');
        if (options.claudeCode || options.all) {
            await uninstallFromClaudeCode();
        }
        if (options.opencode || options.all) {
            await uninstallFromOpenCode();
        }
        logger.info('Uninstallation complete!');
    }
    catch (error) {
        logger.error({ error }, 'Uninstallation failed');
        process.exit(1);
    }
});
// Status command
program
    .command('status')
    .description('Check installation status')
    .action(async () => {
    try {
        await checkStatus();
    }
    catch (error) {
        logger.error({ error }, 'Status check failed');
        process.exit(1);
    }
});
// Run MCP server command
program
    .command('serve')
    .description('Run the MCP server (for testing)')
    .option('--name <name>', 'Server name', 'board-plugin')
    .option('--version <version>', 'Server version', '0.1.0')
    .action(async (options) => {
    try {
        logger.info({ name: options.name, version: options.version }, 'Starting Board MCP Server...');
        const server = (0, mcp_server_1.createMCPServer)({
            name: options.name,
            version: options.version,
        });
        await server.start();
    }
    catch (error) {
        logger.error({ error }, 'Server failed');
        process.exit(1);
    }
});
async function installForClaudeCode(dryRun) {
    logger.info('Installing for Claude Code...');
    // Get Claude Code config directory
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const claudeConfigDir = `${homeDir}/.claude`;
    const mcpConfigPath = `${claudeConfigDir}/mcp_servers.json`;
    const mcpConfig = {
        'board-plugin': {
            command: 'npx',
            args: ['-y', '@board/mcp-server'],
            env: {},
        },
    };
    if (dryRun) {
        logger.info({ path: mcpConfigPath }, 'DRY RUN: Would create/update MCP config');
        logger.info({ config: mcpConfig }, 'Config');
        return;
    }
    // Create config directory if it doesn't exist
    const fs = await import('fs-extra');
    await fs.ensureDir(claudeConfigDir);
    // Read existing config
    let existingConfig = {};
    if (await fs.pathExists(mcpConfigPath)) {
        try {
            existingConfig = await fs.readJson(mcpConfigPath);
        }
        catch {
            existingConfig = {};
        }
    }
    // Merge config
    const newConfig = { ...existingConfig, ...mcpConfig };
    await fs.writeJson(mcpConfigPath, newConfig, { spaces: 2 });
    logger.info({ path: mcpConfigPath }, 'MCP server configured for Claude Code');
}
async function installForOpenCode(dryRun) {
    logger.info('Installing for OpenCode...');
    // Get OpenCode config directory
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const opencodeConfigDir = `${homeDir}/.config/opencode`;
    const configPath = `${opencodeConfigDir}/config.json`;
    // OpenCode uses a different config format
    const opencodeConfig = {
        mcp: {
            servers: {
                'board-plugin': {
                    command: 'npx',
                    args: ['-y', '@board/mcp-server'],
                },
            },
        },
    };
    if (dryRun) {
        logger.info({ path: configPath }, 'DRY RUN: Would create/update OpenCode config');
        logger.info({ config: opencodeConfig }, 'Config');
        return;
    }
    const fs = await import('fs-extra');
    await fs.ensureDir(opencodeConfigDir);
    let existingConfig = {};
    if (await fs.pathExists(configPath)) {
        try {
            existingConfig = await fs.readJson(configPath);
        }
        catch {
            existingConfig = {};
        }
    }
    // Merge configs (simplified)
    if (!existingConfig.mcp)
        existingConfig.mcp = {};
    if (!existingConfig.mcp.servers)
        existingConfig.mcp.servers = {};
    existingConfig.mcp.servers['board-plugin'] = opencodeConfig.mcp.servers['board-plugin'];
    await fs.writeJson(configPath, existingConfig, { spaces: 2 });
    logger.info({ path: configPath }, 'MCP server configured for OpenCode');
}
async function uninstallFromClaudeCode() {
    logger.info('Uninstalling from Claude Code...');
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const mcpConfigPath = `${homeDir}/.claude/mcp_servers.json`;
    const fs = await import('fs-extra');
    if (await fs.pathExists(mcpConfigPath)) {
        const config = await fs.readJson(mcpConfigPath);
        delete config['board-plugin'];
        await fs.writeJson(mcpConfigPath, config, { spaces: 2 });
        logger.info('Removed board-plugin from Claude Code MCP config');
    }
}
async function uninstallFromOpenCode() {
    logger.info('Uninstalling from OpenCode...');
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const configPath = `${homeDir}/.config/opencode/config.json`;
    const fs = await import('fs-extra');
    if (await fs.pathExists(configPath)) {
        const config = await fs.readJson(configPath);
        if (config.mcp?.servers?.['board-plugin']) {
            delete config.mcp.servers['board-plugin'];
            await fs.writeJson(configPath, config, { spaces: 2 });
            logger.info('Removed board-plugin from OpenCode config');
        }
    }
}
async function checkStatus() {
    logger.info('Checking Board Plugin installation status...');
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    // Check Claude Code
    const claudeConfigPath = `${homeDir}/.claude/mcp_servers.json`;
    const fs = await import('fs-extra');
    let claudeInstalled = false;
    if (await fs.pathExists(claudeConfigPath)) {
        try {
            const config = await fs.readJson(claudeConfigPath);
            claudeInstalled = !!config['board-plugin'];
        }
        catch {
            claudeInstalled = false;
        }
    }
    // Check OpenCode
    const opencodeConfigPath = `${homeDir}/.config/opencode/config.json`;
    let opencodeInstalled = false;
    if (await fs.pathExists(opencodeConfigPath)) {
        try {
            const config = await fs.readJson(opencodeConfigPath);
            opencodeInstalled = !!config.mcp?.servers?.['board-plugin'];
        }
        catch {
            opencodeInstalled = false;
        }
    }
    console.log('');
    console.log('Board Plugin Installation Status');
    console.log('=================================');
    console.log(`Claude Code:  ${claudeInstalled ? '✓ Installed' : '✗ Not installed'}`);
    console.log(`OpenCode:     ${opencodeInstalled ? '✓ Installed' : '✗ Not installed'}`);
    console.log('');
}
// Parse arguments only when executed directly, not when imported as a module
// Use require.main === module for CommonJS compatibility
const isMainModule = require.main === module;
if (isMainModule) {
    program.parse(process.argv);
    // Show help if no command provided
    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }
}
//# sourceMappingURL=cli.js.map