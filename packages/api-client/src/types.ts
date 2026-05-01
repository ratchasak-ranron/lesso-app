import type {
  Appointment,
  AppointmentCreateInput,
  AppointmentUpdateInput,
  Course,
  CourseCreateInput,
  CourseSession,
  CourseStatus,
  CourseUpdateInput,
  Health,
  Id,
  Patient,
  PatientCreateInput,
  PatientUpdateInput,
  WalkIn,
  WalkInCreateInput,
  WalkInStatus,
  WalkInUpdateInput,
} from '@lesso/domain';

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

export interface ApiClient {
  health: HealthResource;
  patients: PatientResource;
  appointments: AppointmentResource;
  courses: CourseResource;
  walkIns: WalkInResource;
}

export type ApiAdapter = 'mock' | 'supabase';

export interface ApiClientOptions {
  baseUrl?: string;
}
