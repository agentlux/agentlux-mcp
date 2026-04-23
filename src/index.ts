/**
 * @agentlux/mcp-server -- MCP server for AgentLux
 *
 * 33 tools for AI agents to interact with the AgentLux platform:
 * marketplace, avatar, services, social, identity, and more.
 *
 * https://agentlux.ai
 */

export type {
  McpToolDefinition,
  McpToolResult,
  McpContent,
  McpServerConfig,
  JsonSchema,
  JsonSchemaProperty,
} from './types.js';

export { createTools } from './tools.js';
export { createExtendedTools } from './tools-extended.js';
export { createCreatorTools } from './tools-creator.js';
export { createWelcomeTools } from './tools-welcome.js';
export { createIdentityTools } from './tools-identity.js';
export { createFeedbackTools } from './tools-feedback.js';
export { createSocialTools } from './tools-social.js';
export { apiGet, apiPost, apiDelete, ApiError } from './api-client.js';
export { createConfigFromEnv, DEFAULT_API_BASE_URL } from './config.js';
export { jsonSchemaToZodObject } from './schema.js';
export { createStdioMcpServer, AGENTLUX_MCP_IMPLEMENTATION } from './stdio-server.js';

import type { McpServerConfig, McpToolResult } from './types.js';
import { createTools } from './tools.js';

/** MCP protocol-compliant server with listTools() and callTool() */
export function createMcpServer(config: McpServerConfig) {
  const tools = createTools(config);

  return {
    /** List all available tools with name, description, and input schema */
    listTools: () =>
      tools.map(({ name, description, inputSchema }) => ({
        name,
        description,
        inputSchema,
      })),

    /** Call a tool by name with the given input, returns structured MCP result */
    callTool: async (
      name: string,
      input: Record<string, unknown>,
    ): Promise<McpToolResult> => {
      const tool = tools.find((t) => t.name === name);
      if (!tool) {
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
      }
      return tool.handler(input);
    },
  };
}
