import * as Checkbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { FilterSection } from './FilterSection'
import { PriceRangeFilter } from './PriceRangeFilter'
import { Skeleton } from '@/components/ui/skeleton'
import type { Facet } from '@/lib/api/types'
import { formatCount } from '@/lib/utils/format'

export interface FilterSidebarProps {
  facets: Facet[]
  loading?: boolean
  selected: Record<string, string[]>
  onToggle: (field: string, value: string) => void
  onSetField: (field: string, values: string[]) => void
}

const PRICE_FIELDS = new Set(['price', 'final_price', 'sale_price'])

export function FilterSidebar({
  facets,
  loading,
  selected,
  onToggle,
  onSetField,
}: FilterSidebarProps) {
  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (facets.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">No filters available.</p>
  }

  return (
    <div className="flex flex-col">
      {facets.map((facet) => {
        const sel = selected[facet.field] ?? []
        const title = facet.label ?? facet.field
        const isPrice =
          facet.type === 'range' ||
          facet.type === 'slider' ||
          PRICE_FIELDS.has(facet.field.toLowerCase())

        return (
          <FilterSection key={facet.field} id={facet.field} title={title}>
            {isPrice ? (
              <PriceRangeFilter
                facet={facet}
                selected={sel[0]}
                onChange={(v) => onSetField(facet.field, v ? [v] : [])}
              />
            ) : (
              <ul role="list" className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {facet.values.filter((v) => v.value != null).map((v) => {
                  const value = v.value as string
                  const id = `f-${facet.field}-${value}`
                  const checked = sel.includes(value)
                  return (
                    <li key={value} className="flex items-center gap-2 text-sm">
                      <Checkbox.Root
                        id={id}
                        checked={checked}
                        onCheckedChange={() => onToggle(facet.field, value)}
                        className="flex h-4 w-4 items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-bg)] data-[state=checked]:border-[var(--color-accent)] data-[state=checked]:bg-[var(--color-accent)]"
                      >
                        <Checkbox.Indicator>
                          <Check aria-hidden="true" className="h-3 w-3 text-white" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      <label htmlFor={id} className="flex flex-1 cursor-pointer items-center justify-between gap-2">
                        <span className="truncate">{v.label ?? value}</span>
                        {v.count != null && (
                          <span className="text-xs text-[var(--color-muted)]">
                            {formatCount(v.count)}
                          </span>
                        )}
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}
          </FilterSection>
        )
      })}
    </div>
  )
}
