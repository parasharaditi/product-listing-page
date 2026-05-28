import { X } from 'lucide-react'
import type { Facet } from '@/lib/api/types'

export interface ActiveFilterPillsProps {
  filters: Record<string, string[]>
  facets: Facet[]
  onRemove: (field: string, value: string) => void
  onClearAll: () => void
}

function labelFor(facets: Facet[], field: string, value: string) {
  const facet = facets.find((f) => f.field === field)
  const v = facet?.values.find((fv) => fv.value != null && fv.value === value)
  return { fieldLabel: facet?.label ?? field, valueLabel: v?.label ?? value }
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
            className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/10"
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
