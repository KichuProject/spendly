export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  const num = Number(amount);
  const absNum = Math.abs(num);
  // Indian numbering system: 1,23,456.00
  const parts = absNum.toFixed(2).split('.');
  let intPart = parts[0];
  const decPart = parts[1];
  // Apply Indian grouping: last 3 digits, then groups of 2
  if (intPart.length > 3) {
    const last3 = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    intPart = grouped + ',' + last3;
  }
  const sign = num < 0 ? '-' : '';
  return `${sign}₹${intPart}.${decPart}`;
}

export function parseCurrency(str) {
  if (!str) return 0;
  const cleaned = String(str).replace(/[₹,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function formatCurrencyShort(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (absNum >= 100000) {
    return `${sign}₹${(absNum / 100000).toFixed(1)}L`;
  }
  if (absNum >= 1000) {
    return `${sign}₹${(absNum / 1000).toFixed(1)}K`;
  }
  return `${sign}₹${absNum.toFixed(0)}`;
}
