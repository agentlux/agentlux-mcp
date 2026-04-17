/**
 * Creator MCP tool definitions -- generate item, list item, earnings, boost
 */

import type { McpToolDefinition, McpServerConfig } from './types.js';
import { apiGet, apiPost } from './api-client.js';
import { textResult, errorResult } from './tools-helpers.js';

export function createCreatorTools(config: McpServerConfig): McpToolDefinition[] {
  return [
    createGenerateItemTool(config),
    createListItemTool(config),
    createCheckEarningsTool(config),
    createBoostActivityTool(config),
  ];
}

function createGenerateItemTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_generate_item',
    description:
      'Generate a new marketplace item from a text prompt using AI. ' +
      'Provide a description, category, and optional art style hint. ' +
      'Returns a preview URL and generation status.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Text description or prompt for the AI item generator (e.g., "cyberpunk jacket with neon trim")',
        },
        category: {
          type: 'string',
          description: 'Item category. Valid values: skin, top, bottom, accessory, pet',
          enum: ['skin', 'top', 'bottom', 'accessory', 'pet'],
        },
        style: {
          type: 'string',
          description: 'Art style hint for the AI generator (optional, e.g., "pixel art", "anime", "realistic")',
        },
      },
      required: ['prompt', 'category'],
    },
    handler: async (input) => {
      try {
        const body: Record<string, unknown> = {
          prompt: input.prompt,
          category: input.category,
        };
        if (input.style) body.style = input.style;
        const data = await apiPost(config, '/v1/creators/generate', body);
        return textResult(data);
      } catch (err) {
        return errorResult(`Item generation failed: ${String(err)}`);
      }
    },
  };
}

function createListItemTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_list_item',
    description:
      'List a generated item on the marketplace for sale. ' +
      'Provide the item ID, price in USDC, display name, and optional tags.',
    inputSchema: {
      type: 'object',
      properties: {
        itemId: {
          type: 'string',
          description: 'UUID of the generated item draft to list on the marketplace',
        },
        priceUsdc: {
          type: 'number',
          description: 'Listing price in USD dollars (e.g., 1.50 = $1.50). Minimum $0.50, maximum $1000.00.',
          minimum: 0,
        },
        name: {
          type: 'string',
          description: 'Display name for the marketplace listing',
        },
        description: {
          type: 'string',
          description: 'Item description shown on the marketplace (optional)',
        },
        tags: {
          type: 'string',
          description: 'Comma-separated discovery tags for search (optional, e.g., "cyberpunk,neon,jacket")',
        },
      },
      required: ['itemId', 'priceUsdc', 'name'],
    },
    handler: async (input) => {
      try {
        const body: Record<string, unknown> = {
          generatedItemId: input.itemId,
          priceUsdc: input.priceUsdc,
          name: input.name,
        };
        if (input.description) body.description = input.description;
        if (input.tags) {
          body.tags = String(input.tags).split(',').map((t) => t.trim());
        }
        const data = await apiPost(config, '/v1/creators/items', body);
        return textResult(data);
      } catch (err) {
        return errorResult(`Item listing failed: ${String(err)}`);
      }
    },
  };
}

function createCheckEarningsTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_earnings',
    description:
      'Check creator earnings from marketplace sales. ' +
      'Returns total earnings, pending payout, items sold, and top seller.',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: {
          type: 'string',
          description: 'UUID of the agent to check earnings for',
        },
      },
      required: ['agentId'],
    },
    handler: async (input) => {
      try {
        const agentId = String(input.agentId);
        const data = await apiGet(config, `/v1/agents/${agentId}/earnings`);
        return textResult(data);
      } catch (err) {
        return errorResult(`Earnings check failed: ${String(err)}`);
      }
    },
  };
}

function createBoostActivityTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_boost',
    description:
      'Boost a marketplace item in the activity feed (x402-gated). ' +
      'Costs $0.05-$0.25 USDC. Tiers: basic, featured, spotlight.',
    inputSchema: {
      type: 'object',
      properties: {
        itemId: {
          type: 'string',
          description: 'UUID of the marketplace item to boost',
        },
        tier: {
          type: 'string',
          description: 'Boost tier determining visibility and cost. Valid values: basic ($0.05), featured ($0.15), spotlight ($0.25). Default: basic.',
          enum: ['basic', 'featured', 'spotlight'],
        },
      },
      required: ['itemId'],
    },
    handler: async (input) => {
      try {
        const data = await apiPost(config, '/v1/activity/boost', {
          itemId: input.itemId,
          tier: input.tier ?? 'basic',
        });
        return textResult(data);
      } catch (err) {
        return errorResult(`Boost failed: ${String(err)}`);
      }
    },
  };
}
