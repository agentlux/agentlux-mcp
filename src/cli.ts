#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { createConfigFromEnv } from './config.js';
import { createStdioMcpServer } from './stdio-server.js';

async function main(): Promise<void> {
  const server = createStdioMcpServer(createConfigFromEnv());
  const transport = new StdioServerTransport();

  const shutdown = async (): Promise<void> => {
    await server.close().catch(() => undefined);
    process.exit(0);
  };

  process.once('SIGINT', () => void shutdown());
  process.once('SIGTERM', () => void shutdown());

  await server.connect(transport);
  console.error('AgentLux MCP server running on stdio');
}

main().catch((error: unknown) => {
  console.error('Fatal error starting AgentLux MCP server:', error);
  process.exit(1);
});
