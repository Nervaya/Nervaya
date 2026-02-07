/**
 * Single source of truth for delivery/shipping costs.
 * Used at checkout (delivery options), order creation, and order success page.
 */
export const STANDARD_SHIPPING_FREE_THRESHOLD = 500;
export const STANDARD_SHIPPING_COST = 50;
export const EXPRESS_SHIPPING_COST = 1299;

export type DeliveryMethod = 'standard' | 'express';

export function getShippingCost(method: DeliveryMethod | undefined, subtotal: number): number {
  if (method === 'express') return EXPRESS_SHIPPING_COST;
  return subtotal >= STANDARD_SHIPPING_FREE_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
}
