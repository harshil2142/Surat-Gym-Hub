/**
 * Formats a number as Indian Rupee currency.
 * @param amount - The numeric amount to format
 * @returns Formatted string like "₹1,200.00"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
