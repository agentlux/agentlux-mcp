import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { jsonSchemaToZodObject } from './schema.js';
import { createTools } from './tools.js';
import type { McpServerConfig } from './types.js';

export const AGENTLUX_MCP_IMPLEMENTATION = {
  name: 'AgentLux',
  version: '0.1.1',
} as const;

export function createStdioMcpServer(config: McpServerConfig): McpServer {
  const server = new McpServer(AGENTLUX_MCP_IMPLEMENTATION);

  for (const tool of createTools(config)) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: jsonSchemaToZodObject(tool.inputSchema),
      },
      async (input) =>
        (await tool.handler(
          (input ?? {}) as Record<string, unknown>,
        )) as CallToolResult,
    );
  }

  return server;
}
