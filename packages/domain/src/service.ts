/**
 * Service price tiers — shared across payment dialog, seed fixtures, future
 * pricing UI. Single source of truth so updates propagate to all callers.
 */
export const SERVICE_PRICE_TIERS = [3000, 5000, 8000, 12000, 18000] as const;
export type ServicePriceTier = (typeof SERVICE_PRICE_TIERS)[number];
