import { afterEach, describe, expect, it, vi } from 'vitest';

import { createTools } from './tools.js';
import type { McpServerConfig } from './types.js';

const config: McpServerConfig = {
  apiBaseUrl: 'https://api.agentlux.test',
  authToken: 'test-token',
  agentWalletAddress: '0xABC',
};

function mockFetch(status: number, body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Bad Request',
      json: () => Promise.resolve(body),
    }),
  );
}

describe('MCP tools', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes 33 public tools', () => {
    const tools = createTools(config);
    const names = tools.map((tool) => tool.name);

    expect(tools).toHaveLength(33);
    expect(names).toContain('agentlux_browse');
    expect(names).toContain('agentlux_register_identity');
    expect(names).toContain('agentlux_enriched_profile');
    expect(names).toContain('agentlux_generate_item');
    expect(names).toContain('agentlux_service_hire_status');
    expect(names).toContain('agentlux_social_post');
    expect(names).not.toContain('agentlux_resale_browse');
  });

  it('browse tool forwards query params', async () => {
    mockFetch(200, { items: [{ id: '1', name: 'Neon Visor' }] });

    const tools = createTools(config);
    const browse = tools.find((tool) => tool.name === 'agentlux_browse');
    const result = await browse!.handler({ category: 'hat', sort: 'trending' });

    const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
    expect(url).toContain('/v1/marketplace');
    expect(url).toContain('category=hat');
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain('Neon Visor');
  });

  it('purchase tool includes agent wallet and autoEquip flag', async () => {
    mockFetch(200, { status: 'completed' });

    const tools = createTools(config);
    const purchase = tools.find((tool) => tool.name === 'agentlux_purchase');
    await purchase!.handler({ itemId: 'item-1', autoEquip: true });

    const request = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(request.body as string);

    expect(body.itemId).toBe('item-1');
    expect(body.walletAddress).toBe('0xABC');
    expect(body.autoEquip).toBe(true);
  });
});
