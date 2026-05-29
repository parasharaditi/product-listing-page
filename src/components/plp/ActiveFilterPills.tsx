import { X } from 'lucide-react'
import type { Facet } from '@/lib/api/types'
import { formatPrice } from '@/lib/utils/format'

export interface ActiveFilterPillsProps {
  filters: Record<string, string[]>
  facets: Facet[]
  onRemove: (field: string, value: string) => void
  onClearAll: () => void
}

const PRICE_FIELDS = new Set(['price', 'final_price', 'sale_price'])
const RANGE_RE = /^(-?\d+(?:\.\d+)?)?:(-?\d+(?:\.\d+)?)?$/

function formatValue(field: string, value: string, fallback: string): string {
  const match = RANGE_RE.exec(value)
  if (!match) return fallback
  const [, loRaw, hiRaw] = match
  const isMoney = PRICE_FIELDS.has(field.toLowerCase())
  const fmt = (s: string) => (isMoney ? formatPrice(Number(s)) : s)
  if (loRaw && hiRaw) return `${fmt(loRaw)} – ${fmt(hiRaw)}`
  if (loRaw) return `From ${fmt(loRaw)}`
  if (hiRaw) return `Up to ${fmt(hiRaw)}`
  return fallback
}

function labelFor(facets: Facet[], field: string, value: string) {
  const facet = facets.find((f) => f.field === field)
  const v = facet?.values.find((fv) => fv.value != null && fv.value === value)
  const fieldLabel = facet?.label ?? field
  const fallback = v?.label ?? value
  const valueLabel = formatValue(field, value, fallback)
  return { fieldLabel, valueLabel }
}

export function ActiveFilterPills({
  filters,
  facets,
  onRemove,
  onClearAll,
}: ActiveFilterPillsProps) {
  const entries = Object.entries(filters).flatMap(([field, values]) =>
    values.map((value) => ({ field, value })),
  )
  if (entries.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {entries.map(({ field, value }) => {
        const { fieldLabel, valueLabel } = labelFor(facets, field, value)
        return (
          <button
            key={`${field}:${value}`}
            type="button"
            onClick={() => onRemove(field, value)}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-xs transition-colors hover:bg-black/5"
            aria-label={`Remove filter ${fieldLabel}: ${valueLabel}`}
          >
            <span className="text-[var(--color-muted)]">{fieldLabel}:</span>
            <span>{valueLabel}</span>
            <X aria-hidden="true" className="h-3 w-3" />
          </button>
        )
      })}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs underline underline-offset-2 hover:opacity-80"
      >
        Clear all
      </button>
    </div>
  )
}
