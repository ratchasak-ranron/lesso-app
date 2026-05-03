import { z } from 'zod';
import {
  BranchSchema,
  DEFAULT_COMMISSION_RATE,
  POINTS_PER_BAHT,
  TenantSchema,
  UserSchema,
  type Appointment,
  type Branch,
  type CommissionEntry,
  type Course,
  type Id,
  type InventoryItem,
  type LineItem,
  type LoyaltyAccount,
  type LoyaltyTransaction,
  type Patient,
  type Receipt,
  type Tenant,
  type User,
} from '@reinly/domain';
import { storage } from './storage';
import { genFullName, genServiceName, genThaiPhone, makeRng } from './seed-fixtures';

export const TENANTS_KEY = 'reinly:seed:tenants';
export const BRANCHES_KEY = 'reinly:seed:branches';
export const USERS_KEY = 'reinly:seed:users';
export const SEED_VERSION_KEY = 'reinly:seed:version';
export const SEED_VERSION = 4;

const SEED_KEYS = [TENANTS_KEY, BRANCHES_KEY, USERS_KEY, SEED_VERSION_KEY] as const;

const SEED_TENANTS: Tenant[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'คลินิกสุขใจ' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'คลินิกสวยงาม' },
];

const SEED_BRANCHES: Branch[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    tenantId: '11111111-1111-1111-1111-111111111111',
    name: 'สุขุมวิท',
    city: 'กรุงเทพมหานคร',
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    tenantId: '11111111-1111-1111-1111-111111111111',
    name: 'ทองหล่อ',
    city: 'กรุงเทพมหานคร',
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    tenantId: '22222222-2222-2222-2222-222222222222',
    name: 'เมืองภูเก็ต',
    city: 'ภูเก็ต',
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccd',
    tenantId: '22222222-2222-2222-2222-222222222222',
    name: 'ป่าตอง',
    city: 'ภูเก็ต',
  },
];

const SEED_USERS: User[] = [
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    tenantId: '11111111-1111-1111-1111-111111111111',
    name: 'คุณพลอย',
    role: 'receptionist',
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    tenantId: '11111111-1111-1111-1111-111111111111',
    name: 'หมออนงค์',
    role: 'doctor',
  },
  {
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    tenantId: '11111111-1111-1111-1111-111111111111',
    name: 'คุณศักดิ์',
    role: 'owner',
  },
];

const PATIENT_COUNT_PER_TENANT = 100;
const COURSES_PER_TENANT = 50;
const APPT_DAYS_BACK = 60;
const APPT_DAYS_FORWARD = 7;

function patientsKey(tenantId: Id): string {
  return `reinly:tenant:${tenantId}:patients`;
}
function appointmentsKey(tenantId: Id): string {
  return `reinly:tenant:${tenantId}:appointments`;
}
function coursesKey(tenantId: Id): string {
  return `reinly:tenant:${tenantId}:courses`;
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
      serviceName: `${genServiceName(rng)} แพ็ค ${total} ครั้ง`,
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

const INVENTORY_FIXTURES = [
  { sku: 'BTX-100', name: 'โบทูลินัม 100u', unit: 'unit' as const, min: 10, init: 32 },
  { sku: 'HA-1ML', name: 'ไฮยาลูโรนิก 1ml', unit: 'ml' as const, min: 8, init: 24 },
  { sku: 'LIDO-2', name: 'ลิโดเคน 2ml', unit: 'ml' as const, min: 10, init: 3 },
  { sku: 'GAUZE', name: 'ผ้าก๊อซปลอดเชื้อ', unit: 'pack' as const, min: 50, init: 150 },
  { sku: 'NEEDLE-30G', name: 'เข็ม 30G', unit: 'box' as const, min: 5, init: 12 },
  { sku: 'ALC-500', name: 'แอลกอฮอล์ 500ml', unit: 'unit' as const, min: 6, init: 4 },
  { sku: 'GLOVE-M', name: 'ถุงมือไนไตรล์ ไซส์ M', unit: 'box' as const, min: 4, init: 9 },
  { sku: 'COTTON', name: 'สำลีก้อน', unit: 'pack' as const, min: 20, init: 35 },
];

function generateInventoryForTenant(tenantId: Id, branches: Branch[]): InventoryItem[] {
  const items: InventoryItem[] = [];
  const now = new Date().toISOString();
  for (const branch of branches.filter((b) => b.tenantId === tenantId)) {
    for (const f of INVENTORY_FIXTURES) {
      items.push({
        id: crypto.randomUUID(),
        tenantId,
        branchId: branch.id,
        sku: f.sku,
        name: f.name,
        unit: f.unit,
        currentStock: f.init,
        minStock: f.min,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  return items;
}

interface ReceiptDerivatives {
  receipts: Receipt[];
  commissions: CommissionEntry[];
  loyaltyAccounts: LoyaltyAccount[];
  loyaltyTransactions: LoyaltyTransaction[];
}

const SERVICE_PRICE_TIERS = [3000, 5000, 8000, 12000, 18000] as const;

function generateReceiptDerivatives(
  tenantId: Id,
  appts: Appointment[],
  doctorIds: Id[],
  seedBase: number,
): ReceiptDerivatives {
  const rng = makeRng(seedBase + 3);
  const receipts: Receipt[] = [];
  const commissions: CommissionEntry[] = [];
  const txs: LoyaltyTransaction[] = [];
  const accountsByPatient = new Map<Id, LoyaltyAccount>();
  let receiptCounter = 0;

  const completed = appts.filter((a) => a.status === 'completed');
  for (const appt of completed) {
    receiptCounter += 1;
    const price = SERVICE_PRICE_TIERS[Math.floor(rng() * SERVICE_PRICE_TIERS.length)]!;
    const doctorId = doctorIds[Math.floor(rng() * doctorIds.length)]!;
    const lineItem: LineItem = {
      description: appt.serviceName,
      quantity: 1,
      unitPrice: price,
      amount: price,
      serviceName: appt.serviceName,
      doctorId,
      isCourseRedeem: false,
    };
    const created = appt.startAt;
    const receipt: Receipt = {
      id: crypto.randomUUID(),
      tenantId,
      branchId: appt.branchId,
      patientId: appt.patientId,
      appointmentId: appt.id,
      number: receiptCounter.toString().padStart(5, '0'),
      lineItems: [lineItem],
      subtotal: price,
      tip: 0,
      discount: 0,
      total: price,
      status: 'paid',
      paidAt: created,
      paymentMethod: rng() < 0.6 ? 'cash' : rng() < 0.8 ? 'card' : 'transfer',
      createdAt: created,
      updatedAt: created,
    };
    receipts.push(receipt);

    commissions.push({
      id: crypto.randomUUID(),
      tenantId,
      branchId: appt.branchId,
      doctorId,
      receiptId: receipt.id,
      patientId: appt.patientId,
      serviceName: appt.serviceName,
      baseAmount: price,
      rate: DEFAULT_COMMISSION_RATE,
      amount: Math.round(price * DEFAULT_COMMISSION_RATE),
      status: rng() < 0.7 ? 'accrued' : 'paid',
      createdAt: created,
      paidAt: rng() < 0.3 ? created : undefined,
    });

    let account = accountsByPatient.get(appt.patientId);
    if (!account) {
      account = {
        id: crypto.randomUUID(),
        tenantId,
        patientId: appt.patientId,
        balance: 0,
        lifetimeEarned: 0,
        createdAt: created,
        updatedAt: created,
      };
      accountsByPatient.set(appt.patientId, account);
    }
    const earnedPoints = Math.floor(price * POINTS_PER_BAHT);
    account = {
      ...account,
      balance: account.balance + earnedPoints,
      lifetimeEarned: account.lifetimeEarned + earnedPoints,
      updatedAt: created,
    };
    accountsByPatient.set(appt.patientId, account);
    txs.push({
      id: crypto.randomUUID(),
      tenantId,
      patientId: appt.patientId,
      accountId: account.id,
      type: 'earn',
      amount: earnedPoints,
      balanceAfter: account.balance,
      receiptId: receipt.id,
      createdAt: created,
    });
  }

  return {
    receipts,
    commissions,
    loyaltyAccounts: Array.from(accountsByPatient.values()),
    loyaltyTransactions: txs,
  };
}

export function seedIfEmpty(): void {
  const VersionSchema = z.object({ version: z.number() });
  const existing = storage.read(SEED_VERSION_KEY, VersionSchema);
  if (existing?.version === SEED_VERSION) return;

  storage.write(TENANTS_KEY, SEED_TENANTS);
  storage.write(BRANCHES_KEY, SEED_BRANCHES);
  storage.write(USERS_KEY, SEED_USERS);

  const doctorIdsByTenant = new Map<Id, Id[]>();
  for (const u of SEED_USERS) {
    if (u.role !== 'doctor') continue;
    const list = doctorIdsByTenant.get(u.tenantId) ?? [];
    list.push(u.id);
    doctorIdsByTenant.set(u.tenantId, list);
  }

  SEED_TENANTS.forEach((tenant, idx) => {
    const seedBase = 1000 + idx * 100;
    const patients = generatePatientsForTenant(tenant, seedBase);
    const courses = generateCoursesForTenant(tenant, patients, seedBase);
    const appts = generateAppointmentsForTenant(tenant, SEED_BRANCHES, patients, seedBase);
    storage.write(patientsKey(tenant.id), patients);
    storage.write(coursesKey(tenant.id), courses);
    storage.write(appointmentsKey(tenant.id), appts);

    const doctorIds = doctorIdsByTenant.get(tenant.id) ?? [];
    if (doctorIds.length > 0) {
      const derivatives = generateReceiptDerivatives(tenant.id, appts, doctorIds, seedBase);
      storage.write(`reinly:tenant:${tenant.id}:receipts`, derivatives.receipts);
      storage.write(`reinly:tenant:${tenant.id}:commissions`, derivatives.commissions);
      storage.write(
        `reinly:tenant:${tenant.id}:loyalty-accounts`,
        derivatives.loyaltyAccounts,
      );
      storage.write(
        `reinly:tenant:${tenant.id}:loyalty-transactions`,
        derivatives.loyaltyTransactions,
      );
      storage.write(`reinly:tenant:${tenant.id}:receipts:counter`, {
        value: derivatives.receipts.length,
      });
    }

    storage.write(
      `reinly:tenant:${tenant.id}:inventory-items`,
      generateInventoryForTenant(tenant.id, SEED_BRANCHES),
    );
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
 * `reinly:dev-toolbar`, `reinly:lang`, etc.
 */
export function resetData(): void {
  SEED_KEYS.forEach((key) => storage.remove(key));
  SEED_TENANTS.forEach((t) => {
    storage.remove(patientsKey(t.id));
    storage.remove(appointmentsKey(t.id));
    storage.remove(coursesKey(t.id));
    storage.remove(`reinly:tenant:${t.id}:walk-ins`);
    storage.remove(`reinly:tenant:${t.id}:course-sessions`);
    storage.remove(`reinly:tenant:${t.id}:receipts`);
    storage.remove(`reinly:tenant:${t.id}:receipts:counter`);
    storage.remove(`reinly:tenant:${t.id}:commissions`);
    storage.remove(`reinly:tenant:${t.id}:loyalty-accounts`);
    storage.remove(`reinly:tenant:${t.id}:loyalty-transactions`);
    storage.remove(`reinly:tenant:${t.id}:inventory-items`);
    storage.remove(`reinly:tenant:${t.id}:inventory-movements`);
  });
}
