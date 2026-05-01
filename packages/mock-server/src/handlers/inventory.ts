import { http, HttpResponse } from 'msw';
import {
  InventoryItemCreateSchema,
  InventoryMovementCreateSchema,
  type Id,
} from '@lesso/domain';
import { resolveContext } from '../context';
import {
  InsufficientStockError,
  InventoryItemNotFoundError,
  inventoryRepo,
  type InventoryItemFilter,
} from '../repositories/inventory';
import {
  badRequest,
  conflict,
  noTenant,
  notFound,
  parseIdParam,
  readJson,
} from './_shared';

export const inventoryHandlers = [
  http.get('/v1/inventory/items', ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const url = new URL(request.url);
    const branchId = parseIdParam(url.searchParams.get('branchId'));
    if (branchId === null) {
      return badRequest('VALIDATION', 'Invalid branchId');
    }
    const lowStockOnly = url.searchParams.get('lowStockOnly') === 'true';
    const filter: InventoryItemFilter = { branchId, lowStockOnly };
    const data = inventoryRepo.findAllItems(tenantId, filter);
    return HttpResponse.json({ data, meta: { total: data.length } });
  }),

  http.get('/v1/inventory/items/:id', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const item = inventoryRepo.findItemById(tenantId, params.id as Id);
    if (!item) return notFound('Inventory item not found');
    return HttpResponse.json({ data: item });
  }),

  http.get('/v1/inventory/items/:id/movements', ({ request, params }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const data = inventoryRepo.movementsByItem(tenantId, params.id as Id);
    return HttpResponse.json({ data, meta: { total: data.length } });
  }),

  http.post('/v1/inventory/items', async ({ request }) => {
    const { tenantId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = InventoryItemCreateSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid item', parsed.error.flatten());
    const created = inventoryRepo.createItem(tenantId, parsed.data);
    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  http.post('/v1/inventory/movements', async ({ request }) => {
    const { tenantId, userId } = resolveContext(request);
    if (!tenantId) return noTenant();
    const body = await readJson<unknown>(request);
    const parsed = InventoryMovementCreateSchema.safeParse(body);
    if (!parsed.success) return badRequest('VALIDATION', 'Invalid movement', parsed.error.flatten());
    try {
      const result = inventoryRepo.applyMovement(tenantId, parsed.data, userId ?? undefined);
      return HttpResponse.json({ data: result }, { status: 201 });
    } catch (err) {
      if (err instanceof InsufficientStockError) {
        return conflict('INSUFFICIENT_STOCK', err.message);
      }
      if (err instanceof InventoryItemNotFoundError) {
        return notFound(err.message);
      }
      throw err;
    }
  }),
];
