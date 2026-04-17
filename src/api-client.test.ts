import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, apiGet, apiPost } from './api-client.js';
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

describe('apiGet', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends auth headers when configured', async () => {
    mockFetch(200, { ok: true });
    await apiGet(config, '/v1/test');

    const request = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[1] as RequestInit;
    const headers = request.headers as Record<string, string>;

    expect(headers.Authorization).toBe('Bearer test-token');
    expect(headers['X-Agent-Wallet']).toBe('0xABC');
  });

  it('throws ApiError on non-2xx responses', async () => {
    mockFetch(404, { message: 'Not found' });
    await expect(apiGet(config, '/v1/missing')).rejects.toThrow(ApiError);
  });
});

describe('apiPost', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('serializes JSON bodies', async () => {
    mockFetch(200, { id: '1' });
    await apiPost(config, '/v1/create', { name: 'test' });

    const request = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe('POST');
    expect(request.body).toBe(JSON.stringify({ name: 'test' }));
  });
});
