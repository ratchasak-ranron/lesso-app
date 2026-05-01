import { z } from 'zod';
import {
  CourseSchema,
  CourseSessionSchema,
  type Course,
  type CourseCreateInput,
  type CourseSession,
  type CourseUpdateInput,
  type Id,
} from '@lesso/domain';
import { storage } from '../storage';

const COURSES_KEY = (tenantId: Id) => `lesso:tenant:${tenantId}:courses`;
const SESSIONS_KEY = (tenantId: Id) => `lesso:tenant:${tenantId}:course-sessions`;

function readCourses(tenantId: Id): Course[] {
  return storage.read(COURSES_KEY(tenantId), z.array(CourseSchema)) ?? [];
}

function readSessions(tenantId: Id): CourseSession[] {
  return storage.read(SESSIONS_KEY(tenantId), z.array(CourseSessionSchema)) ?? [];
}

export interface CourseFilter {
  patientId?: Id;
  status?: Course['status'];
}

export interface DecrementInput {
  branchId: Id;
  performedByUserId?: Id;
  appointmentId?: Id;
  notes?: string;
}

export class CourseExhaustedError extends Error {
  constructor(public readonly courseId: Id) {
    super(`Course ${courseId} has no remaining sessions`);
    this.name = 'CourseExhaustedError';
  }
}

export class CourseNotFoundError extends Error {
  constructor(public readonly courseId: Id) {
    super(`Course ${courseId} not found`);
    this.name = 'CourseNotFoundError';
  }
}

export const courseRepo = {
  findAll(tenantId: Id, filter: CourseFilter = {}): Course[] {
    return readCourses(tenantId).filter((c) => {
      if (filter.patientId && c.patientId !== filter.patientId) return false;
      if (filter.status && c.status !== filter.status) return false;
      return true;
    });
  },
  findById(tenantId: Id, id: Id): Course | null {
    return readCourses(tenantId).find((c) => c.id === id) ?? null;
  },
  create(tenantId: Id, input: CourseCreateInput): Course {
    const now = new Date().toISOString();
    const next: Course = {
      ...input,
      id: crypto.randomUUID(),
      tenantId,
      sessionsUsed: 0,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    storage.write(COURSES_KEY(tenantId), [...readCourses(tenantId), next]);
    return next;
  },
  update(tenantId: Id, id: Id, patch: CourseUpdateInput): Course | null {
    const all = readCourses(tenantId);
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) return null;
    const existing = all[idx]!;
    const next: Course = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    storage.write(
      COURSES_KEY(tenantId),
      all.map((c, i) => (i === idx ? next : c)),
    );
    return next;
  },
  delete(tenantId: Id, id: Id): boolean {
    const all = readCourses(tenantId);
    const remaining = all.filter((c) => c.id !== id);
    if (remaining.length === all.length) return false;
    storage.write(COURSES_KEY(tenantId), remaining);
    return true;
  },
  /**
   * Atomically: increments `sessionsUsed`, marks course `completed` if at limit,
   * appends a CourseSession record. Single-pass write per key.
   * Throws CourseExhaustedError when no sessions remain.
   */
  decrement(tenantId: Id, courseId: Id, input: DecrementInput): { course: Course; session: CourseSession } {
    const all = readCourses(tenantId);
    const idx = all.findIndex((c) => c.id === courseId);
    if (idx < 0) throw new CourseNotFoundError(courseId);
    const course = all[idx]!;
    if (course.sessionsUsed >= course.sessionsTotal) {
      throw new CourseExhaustedError(courseId);
    }
    const now = new Date().toISOString();
    const newSessionsUsed = course.sessionsUsed + 1;
    const updatedCourse: Course = {
      ...course,
      sessionsUsed: newSessionsUsed,
      status: newSessionsUsed >= course.sessionsTotal ? 'completed' : course.status,
      updatedAt: now,
    };
    const session: CourseSession = {
      id: crypto.randomUUID(),
      tenantId,
      branchId: input.branchId,
      courseId,
      patientId: course.patientId,
      appointmentId: input.appointmentId,
      performedAt: now,
      performedByUserId: input.performedByUserId,
      notes: input.notes,
    };
    storage.write(
      COURSES_KEY(tenantId),
      all.map((c, i) => (i === idx ? updatedCourse : c)),
    );
    storage.write(SESSIONS_KEY(tenantId), [...readSessions(tenantId), session]);
    return { course: updatedCourse, session };
  },
  sessions(tenantId: Id, courseId: Id): CourseSession[] {
    return readSessions(tenantId).filter((s) => s.courseId === courseId);
  },
};
