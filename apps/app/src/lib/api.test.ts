import { describe, expect, it } from 'vitest';
import { createApiClient, ApiError } from '@lesso/api-client';

describe('createApiClient', () => {
  it('returns mock client', () => {
    const client = createApiClient('mock', { baseUrl: '/v1' });
    expect(client.health).toBeDefined();
    expect(typeof client.health.get).toBe('function');
  });

  it('throws on supabase adapter (Phase A7)', () => {
    expect(() => createApiClient('supabase')).toThrow(/Phase A7/);
  });

  it('exposes ApiError', () => {
    const err = new ApiError(404, 'NOT_FOUND', 'missing');
    expect(err.status).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('missing');
  });
});
