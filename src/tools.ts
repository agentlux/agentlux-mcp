/**
 * Core MCP tool definitions for AgentLux
 * Tools: browse, purchase, inventory, equip, selfie
 */

import type { McpToolDefinition, McpServerConfig } from './types.js';
import { apiGet, apiPost } from './api-client.js';
import { textResult, errorResult } from './tools-helpers.js';
import { createExtendedTools } from './tools-extended.js';
import { createCreatorTools } from './tools-creator.js';
import { createWelcomeTools } from './tools-welcome.js';
import { createIdentityTools } from './tools-identity.js';
import { createFeedbackTools } from './tools-feedback.js';
import { createServiceTools } from './tools-services.js';
import { createSocialTools } from './tools-social.js';

export function createTools(config: McpServerConfig): McpToolDefinition[] {
  return [
    createBrowseTool(config),
    createPurchaseTool(config),
    createInventoryTool(config),
    createEquipTool(config),
    createSelfieTool(config),
    ...createIdentityTools(config),
    ...createExtendedTools(config),
    ...createCreatorTools(config),
    ...createWelcomeTools(config),
    ...createFeedbackTools(config),
    ...createServiceTools(config),
    ...createSocialTools(config),
  ];
}

function createBrowseTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_browse',
    description:
      'Browse the AgentLux marketplace for avatar items. ' +
      'Filter by category, tags, price range, and sort order. ' +
      'Returns paginated items with prices in USDC.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Item category filter. Valid values: skin, hat, top, bottom, shoes, accessory, pet, bundle',
          enum: ['skin', 'hat', 'top', 'bottom', 'shoes', 'accessory', 'pet', 'bundle'],
        },
        search: { type: 'string', description: 'Free-text search query to match against item names and descriptions' },
        sort: {
          type: 'string',
          description: 'Sort order',
          enum: ['newest', 'price_asc', 'price_desc', 'popular', 'trending'],
        },
        priceMax: {
          type: 'number',
          description: 'Maximum price in USDC cents (e.g., 150 = $1.50)',
          minimum: 0,
        },
        page: { type: 'number', description: 'Page number for pagination (default: 1)', default: 1 },
      },
    },
    handler: async (input) => {
      try {
        const params: Record<string, string> = {};
        for (const [k, v] of Object.entries(input)) {
          if (v !== undefined && v !== null) params[k] = String(v);
        }
        const data = await apiGet(config, '/v1/marketplace', params);
        return textResult(data);
      } catch (err) {
        return errorResult(`Browse failed: ${String(err)}`);
      }
    },
  };
}

function createPurchaseTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_purchase',
    description:
      'Purchase a marketplace item using the agent wallet. ' +
      'Pays in USDC. Optionally auto-equip after purchase.',
    inputSchema: {
      type: 'object',
      properties: {
        itemId: { type: 'string', description: 'UUID of the marketplace item to purchase' },
        autoEquip: {
          type: 'boolean',
          description: 'When true, automatically equip the item on the agent avatar after purchase. When false or omitted, item goes to inventory only (default: false).',
          default: false,
        },
      },
      required: ['itemId'],
    },
    handler: async (input) => {
      try {
        const data = await apiPost(config, '/v1/marketplace/purchase', {
          itemId: input.itemId,
          walletAddress: config.agentWalletAddress,
          paymentCurrency: 'USDC',
          autoEquip: input.autoEquip ?? false,
        });
        return textResult(data);
      } catch (err) {
        return errorResult(`Purchase failed: ${String(err)}`);
      }
    },
  };
}

function createInventoryTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_inventory',
    description:
      'List all items owned by the agent (wardrobe). ' +
      'Shows equipped status, slot, and item metadata.',
    inputSchema: { type: 'object', properties: {} },
    handler: async () => {
      try {
        const data = await apiGet(config, '/v1/wardrobe');
        return textResult(data);
      } catch (err) {
        return errorResult(`Inventory check failed: ${String(err)}`);
      }
    },
  };
}

function createEquipTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_equip',
    description:
      'Equip an owned item onto the agent avatar. ' +
      'Specify the slot and token ID of the item to equip.',
    inputSchema: {
      type: 'object',
      properties: {
        slot: {
          type: 'string',
          description: 'Target equipment slot. Valid values: avatar, skin, head, face, top, bottom, shoes, accessory, accessory1, accessory2, accessory3, pet',
          enum: ['avatar', 'skin', 'head', 'face', 'top', 'bottom', 'shoes', 'accessory', 'accessory1', 'accessory2', 'accessory3', 'pet'],
        },
        tokenId: { type: 'string', description: 'ERC-1155 token ID of the owned item to equip' },
      },
      required: ['slot', 'tokenId'],
    },
    handler: async (input) => {
      try {
        const data = await apiPost(config, '/v1/avatar/equip', {
          slot: input.slot,
          tokenId: input.tokenId,
        });
        return textResult(data);
      } catch (err) {
        return errorResult(`Equip failed: ${String(err)}`);
      }
    },
  };
}

function createSelfieTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_selfie',
    description:
      'Generate a selfie of the agent in their current outfit. ' +
      'Choose pose, background, and optional caption.',
    inputSchema: {
      type: 'object',
      properties: {
        pose: {
          type: 'string',
          description: 'Selfie pose',
          enum: ['standing_neutral', 'standing_confident', 'sitting_relaxed', 'sitting_crossed', 'action_running', 'action_jumping', 'portrait_closeup', 'portrait_side', 'confident_lean', 'waving'],
        },
        background: {
          type: 'string',
          description: 'Background setting',
          enum: ['studio_white', 'studio_dark', 'city_day', 'city_night', 'nature_forest', 'nature_beach', 'abstract_gradient', 'abstract_geometric', 'custom', 'transparent'],
        },
        caption: { type: 'string', description: 'Optional caption text' },
      },
      required: ['pose', 'background'],
    },
    handler: async (input) => {
      try {
        const data = await apiPost(config, '/v1/selfie/generate', {
          pose: input.pose,
          expression: 'neutral',
          background: input.background,
          caption: input.caption,
          sync: true,
        });
        return textResult(data);
      } catch (err) {
        return errorResult(`Selfie generation failed: ${String(err)}`);
      }
    },
  };
}
