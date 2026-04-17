/**
 * MCP tool definitions for A2A messaging and service hire interactions
 * Tools: send_message, pending_actions, hire_status
 */

import type { McpToolDefinition, McpServerConfig } from './types.js';
import { apiGet, apiPost } from './api-client.js';
import { textResult, errorResult } from './tools-helpers.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createServiceTools(config: McpServerConfig): McpToolDefinition[] {
  return [
    createSendMessageTool(config),
    createPendingActionsTool(config),
    createHireStatusTool(config),
  ];
}

function createSendMessageTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_service_send_message',
    description:
      'Send an A2A message on an active service hire request. ' +
      'Messages use A2A parts format (text, file, data). ' +
      'Both requester and provider can send messages.',
    inputSchema: {
      type: 'object',
      properties: {
        requestId: {
          type: 'string',
          description: 'UUID of the hire request to send a message on',
        },
        text: {
          type: 'string',
          description: 'Text content of the message',
        },
        role: {
          type: 'string',
          description: 'Sender role (auto-detected from auth if omitted)',
          enum: ['requester', 'provider'],
        },
      },
      required: ['requestId', 'text'],
    },
    handler: async (input) => {
      try {
        const requestId = String(input.requestId);
        if (!UUID_RE.test(requestId)) {
          return errorResult('requestId must be a valid UUID');
        }
        const body: Record<string, unknown> = {
          parts: [{ kind: 'text', text: input.text }],
        };
        if (input.role) body.role = input.role;
        const data = await apiPost(
          config,
          `/v1/services/hire/${requestId}/messages`,
          body,
        );
        return textResult(data);
      } catch (err) {
        return errorResult(`Send message failed: ${String(err)}`);
      }
    },
  };
}

function createPendingActionsTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_service_pending_actions',
    description:
      'List hire requests that need your attention. ' +
      'Returns requests pending accept, delivery, payment, or completion.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async () => {
      try {
        const data = await apiGet(config, '/v1/services/hire/pending-actions');
        return textResult(data);
      } catch (err) {
        return errorResult(`Pending actions check failed: ${String(err)}`);
      }
    },
  };
}

function createHireStatusTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_service_hire_status',
    description:
      'Get the current status and details of a service hire request. ' +
      'Returns request status, listing info, messages, and timeline.',
    inputSchema: {
      type: 'object',
      properties: {
        requestId: {
          type: 'string',
          description: 'UUID of the hire request to check',
        },
      },
      required: ['requestId'],
    },
    handler: async (input) => {
      try {
        const requestId = String(input.requestId);
        if (!UUID_RE.test(requestId)) {
          return errorResult('requestId must be a valid UUID');
        }
        const data = await apiGet(
          config,
          `/v1/services/hire/${requestId}`,
        );
        return textResult(data);
      } catch (err) {
        return errorResult(`Hire status check failed: ${String(err)}`);
      }
    },
  };
}
