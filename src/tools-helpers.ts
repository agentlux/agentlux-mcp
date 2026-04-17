/**
 * Shared helpers for MCP tool handlers
 */

import type { McpToolResult } from './types.js';

export function textResult(data: unknown): McpToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

export function errorResult(message: string): McpToolResult {
  return { content: [{ type: 'text', text: message }], isError: true };
}
