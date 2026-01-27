export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  NAME: 'Indian Rupee',
} as const;

export const formatCurrency = (
  amount: number,
  showSymbol: boolean = true,
): string => {
  if (showSymbol) {
    return `${CURRENCY.SYMBOL}${amount.toLocaleString('en-IN')}`;
  }
  return `${amount.toLocaleString('en-IN')}`;
};
