import { z } from 'zod';
import {
  InventoryItemSchema,
  InventoryMovementSchema,
  type Id,
  type InventoryItem,
  type InventoryItemCreateInput,
  type InventoryMovement,
  type InventoryMovementCreateInput,
} from '@lesso/domain';
import { storage } from '../storage';

const ITEMS_KEY = (tenantId: Id) => `lesso:tenant:${tenantId}:inventory-items`;
const MOVEMENTS_KEY = (tenantId: Id) => `lesso:tenant:${tenantId}:inventory-movements`;

function readItems(tenantId: Id): InventoryItem[] {
  return storage.read(ITEMS_KEY(tenantId), z.array(InventoryItemSchema)) ?? [];
}
function readMovements(tenantId: Id): InventoryMovement[] {
  return storage.read(MOVEMENTS_KEY(tenantId), z.array(InventoryMovementSchema)) ?? [];
}
function writeItems(tenantId: Id, items: InventoryItem[]): void {
  storage.write(ITEMS_KEY(tenantId), items);
}
function writeMovements(tenantId: Id, items: InventoryMovement[]): void {
  storage.write(MOVEMENTS_KEY(tenantId), items);
}

export class InsufficientStockError extends Error {
  constructor(public readonly itemId: Id, public readonly available: number) {
    super(`Insufficient stock for item ${itemId}: ${available} available`);
    this.name = 'InsufficientStockError';
  }
}

export class InventoryItemNotFoundError extends Error {
  constructor(public readonly itemId: Id) {
    super(`Inventory item ${itemId} not found`);
    this.name = 'InventoryItemNotFoundError';
  }
}

export interface InventoryItemFilter {
  branchId?: Id;
  lowStockOnly?: boolean;
}

export const inventoryRepo = {
  findAllItems(tenantId: Id, filter: InventoryItemFilter = {}): InventoryItem[] {
    return readItems(tenantId).filter((i) => {
      if (filter.branchId && i.branchId !== filter.branchId) return false;
      // lowStockOnly: keep items strictly below minStock to match isLowStock helper.
      if (filter.lowStockOnly && i.currentStock >= i.minStock) return false;
      return true;
    });
  },
  findItemById(tenantId: Id, id: Id): InventoryItem | null {
    return readItems(tenantId).find((i) => i.id === id) ?? null;
  },
  createItem(tenantId: Id, input: InventoryItemCreateInput): InventoryItem {
    const now = new Date().toISOString();
    const next: InventoryItem = {
      id: crypto.randomUUID(),
      tenantId,
      branchId: input.branchId,
      sku: input.sku,
      name: input.name,
      unit: input.unit,
      currentStock: input.initialStock,
      minStock: input.minStock,
      unitCost: input.unitCost,
      createdAt: now,
      updatedAt: now,
    };
    writeItems(tenantId, [...readItems(tenantId), next]);
    return next;
  },
  applyMovement(
    tenantId: Id,
    input: InventoryMovementCreateInput,
    performedByUserId?: Id,
  ): { item: InventoryItem; movement: InventoryMovement } {
    const items = readItems(tenantId);
    const idx = items.findIndex((i) => i.id === input.itemId);
    if (idx < 0) throw new InventoryItemNotFoundError(input.itemId);
    const item = items[idx]!;
    let nextStock: number;
    let recordedDelta: number;
    if (input.type === 'in') {
      const qty = Math.abs(input.quantity);
      nextStock = item.currentStock + qty;
      recordedDelta = qty;
    } else if (input.type === 'out') {
      const qty = Math.abs(input.quantity);
      if (item.currentStock < qty) throw new InsufficientStockError(item.id, item.currentStock);
      nextStock = item.currentStock - qty;
      recordedDelta = -qty;
    } else {
      // adjust — caller supplies the new absolute stock level.
      // Persist the delta in the movement record so the audit trail shows
      // actual change rather than the absolute target.
      if (input.quantity < 0) throw new InsufficientStockError(item.id, item.currentStock);
      nextStock = input.quantity;
      recordedDelta = nextStock - item.currentStock;
    }
    const now = new Date().toISOString();
    const updatedItem: InventoryItem = {
      ...item,
      currentStock: nextStock,
      updatedAt: now,
    };
    const movement: InventoryMovement = {
      id: crypto.randomUUID(),
      tenantId,
      branchId: item.branchId,
      itemId: item.id,
      type: input.type,
      quantity: recordedDelta,
      reason: input.reason,
      performedByUserId,
      createdAt: now,
    };
    writeItems(
      tenantId,
      items.map((it, i) => (i === idx ? updatedItem : it)),
    );
    writeMovements(tenantId, [...readMovements(tenantId), movement]);
    return { item: updatedItem, movement };
  },
  movementsByItem(tenantId: Id, itemId: Id): InventoryMovement[] {
    return readMovements(tenantId).filter((m) => m.itemId === itemId);
  },
};
