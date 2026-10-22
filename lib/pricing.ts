import { CAFE_CONFIG } from "../config/cafe";

export interface LineItemRequest {
  itemId: string;
  quantity: number;
  selectedOptionIds?: string[];
}

export interface CalculatedLineItem {
  itemId: string;
  name: string;
  basePrice: number;
  optionCost: number;
  unitPrice: number;
  quantity: number;
  itemTotal: number;
  selectedOptionsSummary: string[];
}

export interface PriceCalculationResult {
  items: CalculatedLineItem[];
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxRatePercent: number;
  taxAmount: number;
  grandTotal: number;
  currency: string;
  currencySymbol: string;
}

/**
 * Server-Authoritative Pricing Calculation Engine.
 * Client-submitted prices or totals are strictly disregarded.
 */
export function calculateOrderPricing(
  requestedItems: LineItemRequest[],
  discountAmount: number = 0,
  taxRateOverride?: number
): PriceCalculationResult {
  let subtotal = 0;
  const calculatedItems: CalculatedLineItem[] = [];

  for (const req of requestedItems) {
    if (req.quantity <= 0) continue;

    const catalogItem = CAFE_CONFIG.menuItems.find((i) => i.id === req.itemId);
    if (!catalogItem) {
      throw new Error(`Item ${req.itemId} not found in verified catalog`);
    }

    if (!catalogItem.isAvailable) {
      throw new Error(`Item "${catalogItem.name}" is currently 86'd / unavailable`);
    }

    let optionCost = 0;
    const optionNames: string[] = [];

    if (req.selectedOptionIds && catalogItem.optionGroups) {
      for (const optId of req.selectedOptionIds) {
        for (const group of catalogItem.optionGroups) {
          const match = group.options.find((o) => o.id === optId);
          if (match) {
            optionCost += match.priceDelta;
            optionNames.push(match.name);
          }
        }
      }
    }

    const unitPrice = catalogItem.basePrice + optionCost;
    const itemTotal = unitPrice * req.quantity;

    subtotal += itemTotal;
    calculatedItems.push({
      itemId: catalogItem.id,
      name: catalogItem.name,
      basePrice: catalogItem.basePrice,
      optionCost,
      unitPrice,
      quantity: req.quantity,
      itemTotal,
      selectedOptionsSummary: optionNames,
    });
  }

  // Pre-tax discount calculation
  const safeDiscount = Math.min(Math.max(0, discountAmount), subtotal);
  const taxableAmount = Math.max(0, subtotal - safeDiscount);

  // Fiscal tax calculation (default 0% per CAFE.md until GSTIN established)
  const taxRate = taxRateOverride !== undefined ? taxRateOverride : CAFE_CONFIG.fiscal.taxRate;
  const taxAmount = Number(((taxableAmount * taxRate) / 100).toFixed(2));
  const grandTotal = Math.round(taxableAmount + taxAmount);

  return {
    items: calculatedItems,
    subtotal,
    discountAmount: safeDiscount,
    taxableAmount,
    taxRatePercent: taxRate,
    taxAmount,
    grandTotal,
    currency: CAFE_CONFIG.fiscal.currency,
    currencySymbol: CAFE_CONFIG.fiscal.currencySymbol,
  };
}

/**
 * Calculates financial totals from a consolidated raw subtotal.
 * Strict deterministic pre-tax discount, decoupled tax, and integer grand total.
 */
export function calculateBillPricingFromTotals(
  subtotal: number,
  discountAmount: number = 0,
  taxRateOverride?: number
) {
  const safeDiscount = Math.min(Math.max(0, discountAmount), subtotal);
  const taxableAmount = Math.max(0, subtotal - safeDiscount);
  const taxRate = taxRateOverride !== undefined ? taxRateOverride : CAFE_CONFIG.fiscal.taxRate;
  const taxAmount = Number(((taxableAmount * taxRate) / 100).toFixed(2));
  const grandTotal = Math.round(taxableAmount + taxAmount);

  return {
    subtotal,
    discountAmount: safeDiscount,
    taxableAmount,
    taxRatePercent: taxRate,
    taxAmount,
    grandTotal,
    currency: CAFE_CONFIG.fiscal.currency,
    currencySymbol: CAFE_CONFIG.fiscal.currencySymbol,
  };
}
