export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function accentClasses(accent: string): { bg: string; text: string; ring: string; bar: string } {
  switch (accent) {
    case 'mint':
      return { bg: 'bg-mint-100', text: 'text-mint-600', ring: 'ring-mint-200', bar: 'bg-mint-500' };
    case 'orange':
      return { bg: 'bg-orange-100', text: 'text-orange-600', ring: 'ring-orange-200', bar: 'bg-orange-500' };
    default:
      return { bg: 'bg-purple-100', text: 'text-purple-600', ring: 'ring-purple-200', bar: 'bg-purple-500' };
  }
}
