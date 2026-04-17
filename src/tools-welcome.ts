/**
 * MCP tool definitions for welcome pack claim and selfie (public, no auth required)
 */

import type { McpToolDefinition, McpServerConfig } from './types.js';
import { apiPost } from './api-client.js';
import { textResult, errorResult } from './tools-helpers.js';

export function createWelcomeTools(config: McpServerConfig): McpToolDefinition[] {
  return [createClaimWelcomePackTool(config), createWelcomeSelfieTool(config)];
}

function createClaimWelcomePackTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_claim_welcome_pack',
    description:
      'Claim a free welcome pack of 5 avatar items. ' +
      'Only walletAddress is required for a virtual claim. ' +
      'Optionally provide an EIP-191 signature and timestamp to activate NFT minting. ' +
      'Each wallet can only claim once.',
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: 'Ethereum wallet address (0x...)',
        },
        signature: {
          type: 'string',
          description: 'Optional EIP-191 signature for activated claim with NFT minting',
        },
        timestamp: {
          type: 'number',
          description:
            'Optional Unix timestamp (must be within 300s of server time, required if signature provided)',
        },
      },
      required: ['walletAddress'],
    },
    handler: async (input) => {
      try {
        const body: Record<string, unknown> = {
          walletAddress: input.walletAddress,
          signature: input.signature,
          timestamp: input.timestamp,
        };
        const data = await apiPost(config, '/v1/welcome-pack/claim', body);
        return textResult(data);
      } catch (err) {
        return errorResult(`Welcome pack claim failed: ${String(err)}`);
      }
    },
  };
}

function createWelcomeSelfieTool(config: McpServerConfig): McpToolDefinition {
  return {
    name: 'agentlux_welcome_selfie',
    description:
      'Take a selfie wearing welcome pack items (no signature required). ' +
      'Must have claimed the welcome pack first. ' +
      'Choose pose, expression, background, and optional caption. ' +
      'Limited to 5 selfies per day per wallet.',
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: 'Ethereum wallet address (0x...)',
        },
        pose: {
          type: 'string',
          description: 'Selfie pose',
          enum: [
            'standing_neutral',
            'standing_confident',
            'sitting_relaxed',
            'sitting_crossed',
            'action_running',
            'action_jumping',
            'portrait_closeup',
            'portrait_side',
            'confident_lean',
            'waving',
          ],
        },
        expression: {
          type: 'string',
          description: 'Facial expression',
          enum: [
            'happy',
            'neutral',
            'excited',
            'cool',
            'surprised',
            'thoughtful',
            'smirk',
            'laughing',
          ],
        },
        background: {
          type: 'string',
          description: 'Background setting',
          enum: [
            'studio_white',
            'studio_dark',
            'city_day',
            'city_night',
            'nature_forest',
            'nature_beach',
            'abstract_gradient',
            'abstract_geometric',
            'custom',
            'transparent',
          ],
        },
        caption: {
          type: 'string',
          description: 'Optional caption text (max 100 chars)',
        },
      },
      required: ['walletAddress', 'pose', 'expression', 'background'],
    },
    handler: async (input) => {
      try {
        const body: Record<string, unknown> = {
          walletAddress: input.walletAddress,
          pose: input.pose,
          expression: input.expression,
          background: input.background,
        };
        if (input.caption) body.caption = input.caption;
        const data = await apiPost(config, '/v1/welcome-pack/selfie', body);
        return textResult(data);
      } catch (err) {
        return errorResult(`Welcome selfie failed: ${String(err)}`);
      }
    },
  };
}
