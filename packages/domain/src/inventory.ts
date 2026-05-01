import { z } from 'zod';
import { IdSchema, IsoDateSchema } from './common';

export const InventoryUnitSchema = z.enum(['unit', 'box', 'ml', 'g', 'pack']);
export type InventoryUnit = z.infer<typeof InventoryUnitSchema>;

export const InventoryMovementTypeSchema = z.enum(['in', 'out', 'adjust']);
export type InventoryMovementType = z.infer<typeof InventoryMovementTypeSchema>;

export const InventoryItemSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  branchId: IdSchema,
  sku: z.string().min(1).max(40),
  name: z.string().min(1).max(120),
  unit: InventoryUnitSchema,
  currentStock: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative(),
  unitCost: z.number().nonnegative().optional(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
});
export type InventoryItem = z.infer<typeof InventoryItemSchema>;

export const InventoryMovementSchema = z.object({
  id: IdSchema,
  tenantId: IdSchema,
  branchId: IdSchema,
  itemId: IdSchema,
  type: InventoryMovementTypeSchema,
  quantity: z.number().int(),
  reason: z.string().max(200).optional(),
  performedByUserId: IdSchema.optional(),
  createdAt: IsoDateSchema,
});
export type InventoryMovement = z.infer<typeof InventoryMovementSchema>;

export const InventoryItemCreateSchema = z.object({
  branchId: IdSchema,
  sku: z.string().min(1).max(40),
  name: z.string().min(1).max(120),
  unit: InventoryUnitSchema,
  initialStock: z.number().int().nonnegative().default(0),
  minStock: z.number().int().nonnegative().default(0),
  unitCost: z.number().nonnegative().optional(),
});
export type InventoryItemCreateInput = z.infer<typeof InventoryItemCreateSchema>;

export const InventoryMovementCreateSchema = z.object({
  itemId: IdSchema,
  type: InventoryMovementTypeSchema,
  quantity: z.number().int(),
  reason: z.string().max(200).optional(),
});
export type InventoryMovementCreateInput = z.infer<typeof InventoryMovementCreateSchema>;

/**
 * Low-stock alert fires when current stock is BELOW the minimum threshold.
 * `<=` would trigger at exactly minStock (e.g., restocking to 10 when min is 10
 * would alert), which is surprising — `<` matches the natural "below min" UX.
 */
export function isLowStock(item: Pick<InventoryItem, 'currentStock' | 'minStock'>): boolean {
  return item.currentStock < item.minStock;
}
