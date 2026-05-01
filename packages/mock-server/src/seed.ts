import { z } from 'zod';
import {
  BranchSchema,
  TenantSchema,
  UserSchema,
  type Appointment,
  type Branch,
  type Course,
  type Id,
  type Patient,
  type Tenant,
  type User,
} from '@lesso/domain';
import { storage } from './storage';
import { genFullName, genServiceName, genThaiPhone, makeRng } from './seed-fixtures';

export const TENANTS_KEY = 'lesso:seed:tenants';
export const BRANCHES_KEY = 'lesso:seed:branches';
export const USERS_KEY = 'lesso:seed:users';
export const SEED_VERSION_KEY = 'lesso:seed:version';
export const SEED_VERSION = 2;

const SEED_KEYS = [TENANTS_KEY, BRANCHES_KEY, USERS_KEY, SEED_VERSION_KEY] as const;

const SEED_TENANTS: Tenant[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Clinic A' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Clinic B' },
];

const SEED_BRANCHES: Branch[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    tenantId: '11111111-1111-1111-1111-111111111111',
    name: 'Sukhumvit',
    city: 'Bangkok',
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    tenantId: '11111111-1111-1111-1111-111111111111',
    name: 'Thonglor',
    city: 'Bangkok',
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    tenantId: '22222222-2222-2222-2222-222222222222',
    name: 'Phuket Town',
    city: 'Phuket',
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccd',
    tenantId: '22222222-2222-2222-2222-222222222222',
    name: 'Patong',
    city: 'Phuket',
  },
];

const SEED_USERS: User[] = [
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    tenantId: '11111111-1111-1111-1111-111111111111',
    name: 'Khun Ploy',
    role: 'receptionist',
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    tenantId: '11111111-1111-1111-1111-111111111111',
    name: 'Dr. Anong',
    role: 'doctor',
  },
  {
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    tenantId: '11111111-1111-1111-1111-111111111111',
    name: 'Khun Sak',
    role: 'owner',
  },
];

const PATIENT_COUNT_PER_TENANT = 100;
const COURSES_PER_TENANT = 50;
const APPT_DAYS_BACK = 60;
const APPT_DAYS_FORWARD = 7;

function patientsKey(tenantId: Id): string {
  return `lesso:tenant:${tenantId}:patients`;
}
function appointmentsKey(tenantId: Id): string {
  return `lesso:tenant:${tenantId}:appointments`;
}
function coursesKey(tenantId: Id): string {
  return `lesso:tenant:${tenantId}:courses`;
}

function generatePatientsForTenant(tenant: Tenant, seedBase: number): Patient[] {
  const rng = makeRng(seedBase);
  const patients: Patient[] = [];
  for (let i = 0; i < PATIENT_COUNT_PER_TENANT; i++) {
    const phone = genThaiPhone(rng);
    const created = new Date(Date.now() - Math.floor(rng() * 365 * 24 * 60 * 60 * 1000));
    const consentExpiringSoon = rng() < 0.15;
    patients.push({
      id: crypto.randomUUID(),
      tenantId: tenant.id,
      fullName: genFullName(rng),
      phoneDigits: phone.digits,
      phoneDisplay: phone.display,
      lineId: rng() < 0.6 ? `@user${Math.floor(rng() * 9999)}` : undefined,
      consentStatus: consentExpiringSoon ? 'expiring_soon' : rng() < 0.8 ? 'valid' : 'missing',
      consentExpiresAt: consentExpiringSoon
        ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
    });
  }
  return patients;
}

function generateCoursesForTenant(
  tenant: Tenant,
  patients: Patient[],
  seedBase: number,
): Course[] {
  const rng = makeRng(seedBase + 1);
  const courses: Course[] = [];
  for (let i = 0; i < COURSES_PER_TENANT; i++) {
    const patient = patients[Math.floor(rng() * patients.length)]!;
    const total = pickFrom(rng, [4, 6, 8, 10]);
    const used = Math.floor(rng() * total);
    const created = new Date(Date.now() - Math.floor(rng() * 180 * 24 * 60 * 60 * 1000));
    courses.push({
      id: crypto.randomUUID(),
      tenantId: tenant.id,
      patientId: patient.id,
      serviceName: `${genServiceName(rng)} ${total}-pack`,
      sessionsTotal: total,
      sessionsUsed: used,
      pricePaid: total * pickFrom(rng, [3000, 5000, 8000, 12000]),
      status: used >= total ? 'completed' : 'active',
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
    });
  }
  return courses;
}

function generateAppointmentsForTenant(
  tenant: Tenant,
  branches: Branch[],
  patients: Patient[],
  seedBase: number,
): Appointment[] {
  const rng = makeRng(seedBase + 2);
  const tenantBranches = branches.filter((b) => b.tenantId === tenant.id);
  const appts: Appointment[] = [];
  // Past appointments — completed
  for (let day = APPT_DAYS_BACK; day >= 1; day--) {
    const apptCount = Math.floor(rng() * 6) + 2;
    for (let i = 0; i < apptCount; i++) {
      appts.push(buildAppointment(rng, tenant, tenantBranches, patients, -day, true));
    }
  }
  // Today + future
  for (let day = 0; day <= APPT_DAYS_FORWARD; day++) {
    const apptCount = day === 0 ? 8 : Math.floor(rng() * 5) + 2;
    for (let i = 0; i < apptCount; i++) {
      appts.push(buildAppointment(rng, tenant, tenantBranches, patients, day, false));
    }
  }
  return appts;
}

function buildAppointment(
  rng: () => number,
  tenant: Tenant,
  branches: Branch[],
  patients: Patient[],
  dayOffset: number,
  isPast: boolean,
): Appointment {
  const branch = branches[Math.floor(rng() * branches.length)]!;
  const patient = patients[Math.floor(rng() * patients.length)]!;
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(9 + Math.floor(rng() * 9), Math.floor(rng() * 4) * 15, 0, 0);
  const duration = pickFrom(rng, [30, 45, 60, 90]);
  const start = new Date(date);
  const end = new Date(date.getTime() + duration * 60_000);
  return {
    id: crypto.randomUUID(),
    tenantId: tenant.id,
    branchId: branch.id,
    patientId: patient.id,
    serviceName: genServiceName(rng),
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    status: isPast ? (rng() < 0.85 ? 'completed' : 'no_show') : 'scheduled',
    createdAt: start.toISOString(),
    updatedAt: start.toISOString(),
  };
}

function pickFrom<T>(rng: () => number, arr: ReadonlyArray<T>): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

export function seedIfEmpty(): void {
  const VersionSchema = z.object({ version: z.number() });
  const existing = storage.read(SEED_VERSION_KEY, VersionSchema);
  if (existing?.version === SEED_VERSION) return;

  storage.write(TENANTS_KEY, SEED_TENANTS);
  storage.write(BRANCHES_KEY, SEED_BRANCHES);
  storage.write(USERS_KEY, SEED_USERS);

  SEED_TENANTS.forEach((tenant, idx) => {
    const seedBase = 1000 + idx * 100;
    const patients = generatePatientsForTenant(tenant, seedBase);
    const courses = generateCoursesForTenant(tenant, patients, seedBase);
    const appts = generateAppointmentsForTenant(tenant, SEED_BRANCHES, patients, seedBase);
    storage.write(patientsKey(tenant.id), patients);
    storage.write(coursesKey(tenant.id), courses);
    storage.write(appointmentsKey(tenant.id), appts);
  });

  storage.write(SEED_VERSION_KEY, { version: SEED_VERSION });
}

export function getTenants(): Tenant[] {
  return storage.read(TENANTS_KEY, z.array(TenantSchema)) ?? [];
}

export function getBranches(): Branch[] {
  return storage.read(BRANCHES_KEY, z.array(BranchSchema)) ?? [];
}

export function getUsers(): User[] {
  return storage.read(USERS_KEY, z.array(UserSchema)) ?? [];
}

/**
 * Clear all seed + tenant-scoped data. Preserves user state in
 * `lesso:dev-toolbar`, `lesso:lang`, etc.
 */
export function resetData(): void {
  SEED_KEYS.forEach((key) => storage.remove(key));
  SEED_TENANTS.forEach((t) => {
    storage.remove(patientsKey(t.id));
    storage.remove(appointmentsKey(t.id));
    storage.remove(coursesKey(t.id));
    storage.remove(`lesso:tenant:${t.id}:walk-ins`);
    storage.remove(`lesso:tenant:${t.id}:course-sessions`);
  });
}
