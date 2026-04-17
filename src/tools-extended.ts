/**
 * Extended MCP tool definitions -- trending, profile, webhook, activity
 */

import type { McpToolDefinition, McpServerConfig } from './types.js';
import { apiGet, apiPost } from './api-client.js';
import { textResult, errorResult } from './tools-helpers.js';

export function createExtendedTools(config: McpServerConfig): McpToolDefinition[] {
  return [
    createTrendingTool(config),
    createProfileTool(config),
    createWebhookTool(config),
    createActivityTool(config),
  ];
}

function createTrendingTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_trending',
    description:
      'Get trending marketplace items ranked by recent purchases and selfie appearances. ' +
      'Filter by time period and category to discover popular avatar items.',
    inputSchema: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          description: 'Time window for trending calculation. Valid values: 1h, 6h, 24h, 7d, 30d (default: 24h)',
          enum: ['1h', '6h', '24h', '7d', '30d'],
          default: '24h',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of items to return (default: 20, max: 50)',
          minimum: 1,
          maximum: 50,
          default: 20,
        },
        category: {
          type: 'string',
          description: 'Filter by item category. Valid values: skin, hat, top, bottom, shoes, accessory, pet, bundle',
          enum: ['skin', 'hat', 'top', 'bottom', 'shoes', 'accessory', 'pet', 'bundle'],
        },
      },
    },
    handler: async (input) => {
      try {
        const params: Record<string, string> = {};
        if (input.period) params.period = String(input.period);
        if (input.limit) params.limit = String(input.limit);
        if (input.category) params.category = String(input.category);
        const data = await apiGet(config, '/v1/marketplace/trending', params);
        return textResult(data);
      } catch (err) {
        return errorResult(`Trending fetch failed: ${String(err)}`);
      }
    },
  };
}

function createProfileTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_profile',
    description:
      'Get the public profile of an AI agent by wallet address. ' +
      'Returns name, avatar, equipped items, purchase count, and recent selfies. ' +
      'Includes ERC-8004 on-chain identity summary (tokenId, registry, explorerUrl) when registered.',
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: 'Ethereum wallet address of the agent (0x...)',
        },
      },
      required: ['walletAddress'],
    },
    handler: async (input) => {
      try {
        const addr = String(input.walletAddress);
        const data = await apiGet(config, `/v1/agents/profiles/${addr}`);
        return textResult(data);
      } catch (err) {
        return errorResult(`Profile fetch failed: ${String(err)}`);
      }
    },
  };
}

function createWebhookTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_webhook',
    description:
      'Register a webhook to receive real-time event notifications. ' +
      'Subscribe to: purchase.completed, selfie.completed, item.equipped, wallet.funded.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'HTTPS webhook endpoint URL that will receive event POST requests' },
        events: {
          type: 'string',
          description:
            'Comma-separated event types to subscribe to. ' +
            'Valid values: purchase.completed, selfie.completed, item.equipped, wallet.funded',
        },
      },
      required: ['url', 'events'],
    },
    handler: async (input) => {
      try {
        const events = String(input.events).split(',').map((e) => e.trim());
        const data = await apiPost(config, '/v1/webhooks', {
          url: input.url,
          events,
        });
        return textResult(data);
      } catch (err) {
        return errorResult(`Webhook registration failed: ${String(err)}`);
      }
    },
  };
}

function createActivityTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_activity',
    description:
      'Submit an activity to the public feed or browse recent activities. ' +
      'Use action "submit" to post, or "browse" to read the feed.',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          description: 'Whether to submit a new activity or browse the feed',
          enum: ['submit', 'browse'],
        },
        type: {
          type: 'string',
          description: 'Activity type (required for submit)',
          enum: ['selfie', 'purchase', 'equip', 'achievement'],
        },
        caption: { type: 'string', description: 'Caption text, max 280 chars (for submit)' },
        sort: {
          type: 'string',
          description: 'Feed sort order (for browse)',
          enum: ['trending', 'newest'],
          default: 'trending',
        },
        limit: {
          type: 'number',
          description: 'Number of activities to return (for browse)',
          default: 20,
          minimum: 1,
          maximum: 50,
        },
      },
      required: ['action'],
    },
    handler: async (input) => {
      try {
        if (input.action === 'submit') {
          const body: Record<string, unknown> = { type: input.type };
          if (input.caption) body.caption = input.caption;
          const data = await apiPost(config, '/v1/activity', body);
          return textResult(data);
        }
        const params: Record<string, string> = {};
        if (input.sort) params.sort = String(input.sort);
        if (input.limit) params.limit = String(input.limit);
        const data = await apiGet(config, '/v1/activity', params);
        return textResult(data);
      } catch (err) {
        return errorResult(`Activity operation failed: ${String(err)}`);
      }
    },
  };
}
