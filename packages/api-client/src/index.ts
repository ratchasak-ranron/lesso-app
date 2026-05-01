import { createMockApiClient } from './adapters/mock';
import { createSupabaseApiClient } from './adapters/supabase';
import type { ApiAdapter, ApiClient, ApiClientOptions } from './types';

export function createApiClient(adapter: ApiAdapter, opts: ApiClientOptions = {}): ApiClient {
  if (adapter === 'mock') return createMockApiClient(opts);
  if (adapter === 'supabase') return createSupabaseApiClient(opts);
  throw new Error(`Unknown adapter: ${adapter as string}`);
}

export { ApiError, AppError } from './errors';
export type {
  ApiAdapter,
  ApiClient,
  ApiClientOptions,
  AppointmentListQuery,
  AppointmentResource,
  CourseDecrementInput,
  CourseListQuery,
  CourseResource,
  HealthResource,
  PatientListQuery,
  PatientResource,
  RequestContext,
  WalkInListQuery,
  WalkInResource,
} from './types';
