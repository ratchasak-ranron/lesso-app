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
  AiLocale,
  AiResource,
  ApiAdapter,
  ApiClient,
  ApiClientOptions,
  AppointmentListQuery,
  AppointmentResource,
  AuditListQuery,
  AuditResource,
  BranchSummary,
  BranchesResource,
  BranchesSummaryQuery,
  CommissionListQuery,
  CommissionResource,
  CommissionSummaryQuery,
  ConsentResource,
  CourseDecrementInput,
  CourseListQuery,
  CourseResource,
  DimensionBucket,
  HealthResource,
  InventoryItemListQuery,
  InventoryResource,
  LoyaltyRedeemInput,
  LoyaltyResource,
  PatientListQuery,
  PatientResource,
  PhotoTagRequest,
  PhotoTagResult,
  ReceiptListQuery,
  ReceiptResource,
  RecallMessageRequest,
  ReportDimension,
  ReportsByDimensionQuery,
  ReportsResource,
  RequestContext,
  SlotSuggestionRequest,
  SuggestedSlot,
  VisitSummaryRequest,
  WalkInListQuery,
  WalkInResource,
} from './types';
