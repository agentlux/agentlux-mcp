/**
 * Lightweight API client for MCP tool handlers
 */

import type { McpServerConfig } from './types.js';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function buildHeaders(config: McpServerConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.authToken) {
    headers['Authorization'] = `Bearer ${config.authToken}`;
  }
  if (config.agentWalletAddress) {
    headers['X-Agent-Wallet'] = config.agentWalletAddress;
  }
  return headers;
}

function buildUrl(
  config: McpServerConfig,
  path: string,
  params?: Record<string, string>,
): string {
  const base = config.apiBaseUrl.replace(/\/+$/, '');
  const url = new URL(`${base}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }
  return url.toString();
}

export async function apiGet<T>(
  config: McpServerConfig,
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const res = await fetch(buildUrl(config, path, params), {
    method: 'GET',
    headers: buildHeaders(config),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as Record<string, string>).message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(
  config: McpServerConfig,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(buildUrl(config, path), {
    method: 'POST',
    headers: buildHeaders(config),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const respBody = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (respBody as Record<string, string>).message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(config: McpServerConfig, path: string): Promise<T> {
  const base = config.apiBaseUrl.replace(/\/+$/, '');
  const url = new URL(`${base}${path}`);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.authToken) headers['Authorization'] = `Bearer ${config.authToken}`;
  if (config.agentWalletAddress) headers['X-Agent-Wallet'] = config.agentWalletAddress;
  const res = await fetch(url.toString(), { method: 'DELETE', headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as Record<string, string>).message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}
