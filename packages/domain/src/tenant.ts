import { z } from 'zod';
import { IdSchema } from './common';

export const TenantSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
});
export type Tenant = z.infer<typeof TenantSchema>;

export const BranchSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  name: z.string().min(1),
  city: z.string().optional(),
});
export type Branch = z.infer<typeof BranchSchema>;

export const UserRoleSchema = z.enum(['receptionist', 'doctor', 'manager', 'owner']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  name: z.string().min(1),
  role: UserRoleSchema,
});
export type User = z.infer<typeof UserSchema>;
