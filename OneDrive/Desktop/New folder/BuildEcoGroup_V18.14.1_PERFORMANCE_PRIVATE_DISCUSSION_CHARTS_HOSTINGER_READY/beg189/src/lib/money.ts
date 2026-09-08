/**
 * BuildEcoGroup V17 — Indian Rupee (INR) Currency & Commercial Calculation Utilities
 * 
 * Complies with Indian numbering grouping (e.g. ₹1,25,000 / ₹45,50,000 / ₹1,20,50,000)
 * Uses high-precision rounded decimal calculations for authoritative financial numbers.
 */

export function round2(value: number): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a numeric value into standard Indian Currency string (e.g. ₹1,25,000 or ₹1,25,000.50)
 */
export function formatINR(amount: number | string | null | undefined, options?: {
  includePrefix?: boolean;
  showDecimals?: boolean;
}): string {
  if (amount === null || amount === undefined || amount === '') {
    return options?.includePrefix !== false ? '₹0' : '0';
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return options?.includePrefix !== false ? '₹0' : '0';
  }

  const prefix = options?.includePrefix !== false ? '₹' : '';
  const showDecimals = options?.showDecimals ?? (Math.abs(num % 1) > 0.001);

  const rounded = Math.abs(round2(num));
  const [intPart, decPart] = rounded.toFixed(2).split('.');

  // Indian Number System Grouping (Last 3 digits, then groups of 2 digits)
  let lastThree = intPart.substring(intPart.length - 3);
  const otherNumbers = intPart.substring(0, intPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const sign = num < 0 ? '-' : '';
  const decimalStr = showDecimals && decPart ? `.${decPart}` : '';

  return `${sign}${prefix}${formattedInt}${decimalStr}`;
}

/**
 * Formats large amounts into Lakhs or Crores for scannable display
 * e.g. 1500000 -> "₹15.00 Lakhs", 25000000 -> "₹2.50 Cr"
 */
export function formatINRLarge(amount: number | string | null | undefined): string {
  if (!amount) return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';

  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (num >= 100000) {
    const lakh = num / 100000;
    return `₹${lakh.toFixed(2).replace(/\.00$/, '')} Lakhs`;
  }
  return formatINR(num);
}

/**
 * Parses an INR formatted string or user input into clean float
 */
export function parseINR(value: string | number): number {
  if (typeof value === 'number') return round2(value);
  if (!value) return 0;
  const clean = value.replace(/[₹,\s]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : round2(parsed);
}

/**
 * Formats a percentage number with precision
 */
export function formatPercentage(val: number | null | undefined, decimals = 1): string {
  if (val === null || val === undefined || isNaN(val)) return '0%';
  return `${round2(val).toFixed(decimals).replace(/\.0$/, '')}%`;
}

/**
 * Calculates item totals authoritatively
 */
export function calculateBOQItemLine(item: {
  quantity: number;
  baseRate: number;
  taxRate?: number;
}): {
  baseAmount: number;
  taxAmount: number;
  lineTotal: number;
} {
  const quantity = Math.max(0, item.quantity || 0);
  const baseRate = Math.max(0, item.baseRate || 0);
  const taxRate = Math.max(0, item.taxRate || 0);

  const baseAmount = round2(quantity * baseRate);
  const taxAmount = round2(baseAmount * (taxRate / 100));
  const lineTotal = round2(baseAmount + taxAmount);

  return {
    baseAmount,
    taxAmount,
    lineTotal,
  };
}

/**
 * Calculates revision totals including subtotals, taxes, and adjustments
 */
export function calculateBOQRevisionTotals(
  items: Array<{ quantity: number; baseRate: number; taxRate?: number }>,
  adjustments: Array<{ calculationType: 'PERCENTAGE' | 'FIXED_AMOUNT'; value: number; type: string }> = []
): {
  subtotal: number;
  taxTotal: number;
  adjustmentTotal: number;
  grandTotal: number;
} {
  let subtotal = 0;
  let taxTotal = 0;

  for (const item of items) {
    const { baseAmount, taxAmount } = calculateBOQItemLine(item);
    subtotal += baseAmount;
    taxTotal += taxAmount;
  }

  subtotal = round2(subtotal);
  taxTotal = round2(taxTotal);

  let adjustmentTotal = 0;
  for (const adj of adjustments) {
    const val = adj.value || 0;
    let adjAmount = 0;
    if (adj.calculationType === 'PERCENTAGE') {
      adjAmount = round2(subtotal * (val / 100));
    } else {
      adjAmount = round2(val);
    }
    // If discount, it reduces total
    if (adj.type === 'DISCOUNT') {
      adjAmount = -Math.abs(adjAmount);
    }
    adjustmentTotal += adjAmount;
  }

  adjustmentTotal = round2(adjustmentTotal);
  const grandTotal = round2(Math.max(0, subtotal + taxTotal + adjustmentTotal));

  return {
    subtotal,
    taxTotal,
    adjustmentTotal,
    grandTotal,
  };
}
