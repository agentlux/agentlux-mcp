/**
 * MCP server types for AgentLux
 */

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  handler: (input: Record<string, unknown>) => Promise<McpToolResult>;
}

export interface JsonSchema {
  type: 'object';
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
}

export interface JsonSchemaProperty {
  type: string;
  description: string;
  enum?: string[];
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
}

export interface McpToolResult {
  content: McpContent[];
  isError?: boolean;
}

export interface McpContent {
  type: 'text';
  text: string;
}

export interface McpServerConfig {
  apiBaseUrl: string;
  authToken?: string;
  agentWalletAddress?: string;
  agentId?: string;
}
