import type {
  Appointment,
  AppointmentCreateInput,
  AppointmentUpdateInput,
  AuditAction,
  AuditLog,
  AuditLogCreateInput,
  CommissionEntry,
  CommissionStatus,
  ConsentCaptureInput,
  ConsentRecord,
  ConsentWithdrawInput,
  Course,
  CourseCreateInput,
  CourseSession,
  CourseStatus,
  CourseUpdateInput,
  DoctorCommissionSummary,
  Health,
  Id,
  InventoryItem,
  InventoryItemCreateInput,
  InventoryMovement,
  InventoryMovementCreateInput,
  LoyaltyAccount,
  LoyaltyTransaction,
  Patient,
  PatientCreateInput,
  PatientUpdateInput,
  Receipt,
  ReceiptCreateInput,
  WalkIn,
  WalkInCreateInput,
  WalkInStatus,
  WalkInUpdateInput,
} from '@reinly/domain';

export interface RequestContext {
  tenantId: Id | null;
  branchId: Id | null;
  userId: Id | null;
}

export interface HealthResource {
  get(ctx?: RequestContext): Promise<Health>;
}

export interface PatientListQuery {
  q?: string;
}

export interface PatientResource {
  list(ctx: RequestContext, query?: PatientListQuery): Promise<Patient[]>;
  get(ctx: RequestContext, id: Id): Promise<Patient>;
  create(ctx: RequestContext, input: PatientCreateInput): Promise<Patient>;
  update(ctx: RequestContext, id: Id, patch: PatientUpdateInput): Promise<Patient>;
  delete(ctx: RequestContext, id: Id): Promise<void>;
}

export interface AppointmentListQuery {
  branchId?: Id;
  patientId?: Id;
  date?: string;
}

export interface AppointmentResource {
  list(ctx: RequestContext, query?: AppointmentListQuery): Promise<Appointment[]>;
  get(ctx: RequestContext, id: Id): Promise<Appointment>;
  create(ctx: RequestContext, input: AppointmentCreateInput): Promise<Appointment>;
  update(ctx: RequestContext, id: Id, patch: AppointmentUpdateInput): Promise<Appointment>;
  delete(ctx: RequestContext, id: Id): Promise<void>;
}

export interface CourseListQuery {
  patientId?: Id;
  status?: CourseStatus;
}

export interface CourseDecrementInput {
  branchId: Id;
  performedByUserId?: Id;
  appointmentId?: Id;
  notes?: string;
}

export interface CourseResource {
  list(ctx: RequestContext, query?: CourseListQuery): Promise<Course[]>;
  get(ctx: RequestContext, id: Id): Promise<Course>;
  sessions(ctx: RequestContext, id: Id): Promise<CourseSession[]>;
  create(ctx: RequestContext, input: CourseCreateInput): Promise<Course>;
  update(ctx: RequestContext, id: Id, patch: CourseUpdateInput): Promise<Course>;
  decrement(
    ctx: RequestContext,
    id: Id,
    input: CourseDecrementInput,
  ): Promise<{ course: Course; session: CourseSession }>;
  delete(ctx: RequestContext, id: Id): Promise<void>;
}

export interface WalkInListQuery {
  branchId?: Id;
  status?: WalkInStatus;
  date?: string;
}

export interface WalkInResource {
  list(ctx: RequestContext, query?: WalkInListQuery): Promise<WalkIn[]>;
  get(ctx: RequestContext, id: Id): Promise<WalkIn>;
  create(ctx: RequestContext, input: WalkInCreateInput): Promise<WalkIn>;
  update(ctx: RequestContext, id: Id, patch: WalkInUpdateInput): Promise<WalkIn>;
  delete(ctx: RequestContext, id: Id): Promise<void>;
}

export interface ReceiptListQuery {
  branchId?: Id;
  patientId?: Id;
  from?: string;
  to?: string;
}

export interface ReceiptResource {
  list(ctx: RequestContext, query?: ReceiptListQuery): Promise<Receipt[]>;
  get(ctx: RequestContext, id: Id): Promise<Receipt>;
  create(ctx: RequestContext, input: ReceiptCreateInput): Promise<Receipt>;
}

export interface CommissionListQuery {
  doctorId?: Id;
  branchId?: Id;
  status?: CommissionStatus;
  from?: string;
  to?: string;
}

export interface CommissionSummaryQuery {
  branchId?: Id;
  from?: string;
  to?: string;
}

export interface CommissionResource {
  list(ctx: RequestContext, query?: CommissionListQuery): Promise<CommissionEntry[]>;
  summary(ctx: RequestContext, query?: CommissionSummaryQuery): Promise<DoctorCommissionSummary[]>;
  pay(ctx: RequestContext, id: Id): Promise<CommissionEntry>;
}

export interface LoyaltyRedeemInput {
  patientId: Id;
  points: number;
  receiptId?: Id;
  reason?: string;
}

export interface LoyaltyResource {
  listAccounts(ctx: RequestContext): Promise<{
    accounts: LoyaltyAccount[];
    totalOutstanding: number;
  }>;
  accountByPatient(ctx: RequestContext, patientId: Id): Promise<LoyaltyAccount>;
  transactionsByPatient(ctx: RequestContext, patientId: Id): Promise<LoyaltyTransaction[]>;
  redeem(
    ctx: RequestContext,
    input: LoyaltyRedeemInput,
  ): Promise<{ account: LoyaltyAccount; transaction: LoyaltyTransaction }>;
}

export interface InventoryItemListQuery {
  branchId?: Id;
  lowStockOnly?: boolean;
}

export interface InventoryResource {
  listItems(ctx: RequestContext, query?: InventoryItemListQuery): Promise<InventoryItem[]>;
  getItem(ctx: RequestContext, id: Id): Promise<InventoryItem>;
  movementsByItem(ctx: RequestContext, id: Id): Promise<InventoryMovement[]>;
  createItem(ctx: RequestContext, input: InventoryItemCreateInput): Promise<InventoryItem>;
  applyMovement(
    ctx: RequestContext,
    input: InventoryMovementCreateInput,
  ): Promise<{ item: InventoryItem; movement: InventoryMovement }>;
}

export interface BranchSummary {
  branchId: Id;
  branchName: string;
  city?: string;
  revenue: number;
  visitCount: number;
  topDoctorId: Id | null;
  topDoctorAmount: number;
  lowStockCount: number;
}

export interface BranchesSummaryQuery {
  from?: string;
  to?: string;
}

export interface BranchesResource {
  summary(ctx: RequestContext, query?: BranchesSummaryQuery): Promise<BranchSummary[]>;
}

export type ReportDimension = 'doctor' | 'service' | 'branch';

export interface DimensionBucket {
  key: string;
  label: string;
  visitCount: number;
  revenue: number;
}

export interface ReportsByDimensionQuery {
  dimension: ReportDimension;
  branchId?: Id;
  from?: string;
  to?: string;
}

export interface ReportsResource {
  byDimension(ctx: RequestContext, query: ReportsByDimensionQuery): Promise<DimensionBucket[]>;
}

export type AiLocale = 'th' | 'en';

export interface VisitSummaryRequest {
  patientId: Id;
  serviceName: string;
  sessionN: number;
  locale: AiLocale;
}

export interface RecallMessageRequest {
  patientId: Id;
  // patientName intentionally NOT in this contract. Server resolves the
  // patient's name from `patientId` before template substitution so PII
  // stays off the wire. The A7 LLM swap must continue to receive ID-only
  // input — never forward names to third-party AI providers.
  serviceName: string;
  weeksSinceLastVisit: number;
  remainingSessions: number;
  locale: AiLocale;
}

export interface SlotSuggestionRequest {
  patientId: Id;
  doctorId?: Id;
  serviceName: string;
  preferDays?: ReadonlyArray<number>;
  locale: AiLocale;
}

export interface SuggestedSlot {
  startAt: string;
  endAt: string;
  rationale: string;
}

export interface PhotoTagRequest {
  patientId: Id;
  photoId: string;
}

export interface PhotoTagResult {
  tags: string[];
  category: 'before' | 'after' | 'progress' | 'other';
  confidence: number;
}

export interface AiResource {
  visitSummary(ctx: RequestContext, input: VisitSummaryRequest): Promise<{ text: string }>;
  recallMessage(ctx: RequestContext, input: RecallMessageRequest): Promise<{ text: string }>;
  suggestSlots(
    ctx: RequestContext,
    input: SlotSuggestionRequest,
  ): Promise<{ slots: SuggestedSlot[] }>;
  tagPhoto(ctx: RequestContext, input: PhotoTagRequest): Promise<PhotoTagResult>;
}

export interface AuditListQuery {
  action?: AuditAction;
  resourceType?: string;
  userId?: Id;
  from?: string;
  to?: string;
}

export interface AuditResource {
  list(ctx: RequestContext, query?: AuditListQuery): Promise<AuditLog[]>;
  append(ctx: RequestContext, input: AuditLogCreateInput): Promise<AuditLog>;
}

export interface ConsentResource {
  byPatient(
    ctx: RequestContext,
    patientId: Id,
  ): Promise<{ records: ConsentRecord[]; active: ConsentRecord | null }>;
  capture(ctx: RequestContext, input: ConsentCaptureInput): Promise<ConsentRecord>;
  withdraw(ctx: RequestContext, input: ConsentWithdrawInput): Promise<ConsentRecord>;
}

export interface ApiClient {
  health: HealthResource;
  patients: PatientResource;
  appointments: AppointmentResource;
  courses: CourseResource;
  walkIns: WalkInResource;
  receipts: ReceiptResource;
  commissions: CommissionResource;
  loyalty: LoyaltyResource;
  inventory: InventoryResource;
  branches: BranchesResource;
  reports: ReportsResource;
  ai: AiResource;
  audit: AuditResource;
  consent: ConsentResource;
}

export type ApiAdapter = 'mock' | 'supabase';

export interface ApiClientOptions {
  baseUrl?: string;
}
