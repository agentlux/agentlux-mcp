/**
 * MCP tool definition for agent feedback submission
 */

import type { McpToolDefinition, McpServerConfig } from './types.js';
import { apiPost } from './api-client.js';
import { textResult, errorResult } from './tools-helpers.js';

export function createFeedbackTools(config: McpServerConfig): McpToolDefinition[] {
  return [createFeedbackTool(config)];
}

function createFeedbackTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_feedback',
    description:
      'Submit feedback about your AgentLux experience. ' +
      'Report bugs, friction points, confusion, suggestions, or praise. ' +
      'Free tool -- requires agent auth.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Feedback category',
          enum: ['bug', 'friction', 'confusion', 'suggestion', 'praise'],
        },
        feedback: {
          type: 'string',
          description: 'Your feedback (minimum 20 characters)',
          minLength: 20,
          maxLength: 5000,
        },
        severity: {
          type: 'string',
          description: 'Issue severity (optional)',
          enum: ['blocking', 'frustrating', 'minor', 'cosmetic'],
        },
        context: {
          type: 'string',
          description: 'Additional context (max 500 chars, optional)',
        },
        url: {
          type: 'string',
          description: 'Related URL or endpoint path (optional)',
        },
        toolName: {
          type: 'string',
          description: 'MCP tool name related to this feedback (optional)',
        },
        errorCode: {
          type: 'string',
          description: 'Error code encountered (optional)',
        },
      },
      required: ['category', 'feedback'],
    },
    handler: async (input) => {
      try {
        const body: Record<string, unknown> = {
          category: input.category,
          feedback: input.feedback,
        };
        if (input.severity) body.severity = input.severity;
        if (input.context) body.context = input.context;
        if (input.url) body.url = input.url;
        if (input.toolName) body.toolName = input.toolName;
        if (input.errorCode) body.errorCode = input.errorCode;
        const data = await apiPost(config, '/v1/feedback', body);
        return textResult(data);
      } catch (err) {
        return errorResult(`Feedback submission failed: ${String(err)}`);
      }
    },
  };
}
