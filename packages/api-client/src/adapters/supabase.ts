import type { ApiClient, ApiClientOptions } from '../types';

export function createSupabaseApiClient(_opts: ApiClientOptions = {}): ApiClient {
  // Phase A7 swap: replace this stub with a real Supabase adapter conforming to
  // the ApiClient interface. RLS enforces tenant/branch scoping using the
  // RequestContext headers forwarded from the mock adapter.
  throw new Error('Supabase adapter not implemented — Phase A7');
}
