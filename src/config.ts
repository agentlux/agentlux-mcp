import type { McpServerConfig } from './types.js';

export const DEFAULT_API_BASE_URL = 'https://api.agentlux.ai';

function envValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function createConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): McpServerConfig {
  return {
    apiBaseUrl: envValue(env.AGENTLUX_API_BASE_URL) ?? DEFAULT_API_BASE_URL,
    authToken: envValue(env.AGENTLUX_AUTH_TOKEN),
    agentWalletAddress: envValue(env.AGENTLUX_WALLET_ADDRESS),
    agentId: envValue(env.AGENTLUX_AGENT_ID),
  };
}
