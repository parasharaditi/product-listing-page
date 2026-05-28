const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export function formatPrice(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return '—'
  return priceFormatter.format(value)
}

export function discountPercent(price: number, msrp?: number): number | null {
  if (!msrp || msrp <= price || price <= 0) return null
  return Math.round(((msrp - price) / msrp) * 100)
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}
