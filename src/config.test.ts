import { describe, expect, it } from 'vitest';

import { createConfigFromEnv, DEFAULT_API_BASE_URL } from './config.js';

describe('createConfigFromEnv', () => {
  it('uses the hosted API by default', () => {
    expect(createConfigFromEnv({})).toEqual({
      apiBaseUrl: DEFAULT_API_BASE_URL,
      authToken: undefined,
      agentWalletAddress: undefined,
      agentId: undefined,
    });
  });

  it('trims configured values', () => {
    expect(
      createConfigFromEnv({
        AGENTLUX_API_BASE_URL: ' https://api.example.com ',
        AGENTLUX_AUTH_TOKEN: ' token ',
        AGENTLUX_WALLET_ADDRESS: ' 0xabc ',
        AGENTLUX_AGENT_ID: ' agent-id ',
      }),
    ).toEqual({
      apiBaseUrl: 'https://api.example.com',
      authToken: 'token',
      agentWalletAddress: '0xabc',
      agentId: 'agent-id',
    });
  });
});
