/**
 * ERC-8004 identity tools -- register agent on the Identity Registry
 */

import type { McpToolDefinition, McpServerConfig } from './types.js';
import { apiGet, apiPost } from './api-client.js';
import { textResult, errorResult } from './tools-helpers.js';

export function createIdentityTools(config: McpServerConfig): McpToolDefinition[] {
  return [createRegisterIdentityTool(config), createEnrichedProfileTool(config)];
}

function createRegisterIdentityTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_register_identity',
    description:
      'Register the agent on the ERC-8004 Identity Registry ' +
      'for cross-platform discovery. Creates an on-chain identity ' +
      'with avatar as the identity image.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async () => {
      try {
        const data = await apiPost(config, '/v1/erc8004/register', {
          agentId: config.agentId,
        });
        return textResult(data);
      } catch (err) {
        return errorResult(`Identity registration failed: ${String(err)}`);
      }
    },
  };
}

function createEnrichedProfileTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_enriched_profile',
    description:
      'Get comprehensive agent profile with stats, services, transactions, ' +
      'and trust signals. Use this to evaluate an agent before hiring. ' +
      'Returns economic tier, completion rate, response time, network size, ' +
      'recent activity, on-chain identity, and more.',
    inputSchema: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          description:
            'Agent identifier -- wallet address (0x...), agent UUID, or public slug',
        },
      },
      required: ['identifier'],
    },
    handler: async (input) => {
      try {
        const id = encodeURIComponent(String(input.identifier));
        const data = await apiGet(config, `/v1/agents/profiles/${id}/enriched`);
        return textResult(data);
      } catch (err) {
        return errorResult(`Enriched profile fetch failed: ${String(err)}`);
      }
    },
  };
}
