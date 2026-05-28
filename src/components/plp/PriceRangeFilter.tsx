import * as Slider from '@radix-ui/react-slider'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Facet } from '@/lib/api/types'
import { formatPrice } from '@/lib/utils/format'

export interface PriceRangeFilterProps {
  facet: Facet
  /** Selected value, e.g. "10:50" — matches Searchspring range filter convention. */
  selected: string | undefined
  onChange: (value: string | undefined) => void
}

function parseSelected(value: string | undefined, fallback: [number, number]): [number, number] {
  if (!value) return fallback
  const [lo, hi] = value.split(':').map(Number)
  if (Number.isFinite(lo) && Number.isFinite(hi)) return [lo!, hi!]
  return fallback
}

export function PriceRangeFilter({ facet, selected, onChange }: PriceRangeFilterProps) {
  // If the facet uses bucketed values (low/high pairs) rather than a numeric range,
  // derive min/max from the values list.
  const fromValues = facet.values.reduce<{ min: number; max: number } | null>((acc, v) => {
    if (v.low == null && v.high == null) return acc
    const lo = v.low ?? acc?.min ?? Infinity
    const hi = v.high ?? acc?.max ?? -Infinity
    if (!acc) return { min: lo, max: hi }
    return { min: Math.min(acc.min, lo), max: Math.max(acc.max, hi) }
  }, null)
  const min = Math.floor(facet.min ?? fromValues?.min ?? 0)
  const max = Math.ceil(facet.max ?? fromValues?.max ?? 1000)
  const step = facet.step ?? Math.max(1, Math.round((max - min) / 100))
  const [range, setRange] = useState<[number, number]>(() =>
    parseSelected(selected, [min, max]),
  )

  useEffect(() => {
    setRange(parseSelected(selected, [min, max]))
  }, [selected, min, max])

  if (max <= min) return null

  return (
    <div className="space-y-3 px-1">
      <Slider.Root
        min={min}
        max={max}
        step={step}
        value={range}
        onValueChange={(v) => setRange([v[0]!, v[1]!])}
        onValueCommit={(v) => {
          const lo = v[0]!
          const hi = v[1]!
          if (lo === min && hi === max) onChange(undefined)
          else onChange(`${lo}:${hi}`)
        }}
        className="relative flex h-5 w-full items-center"
        aria-label="Price range"
      >
        <Slider.Track className="relative h-1 w-full grow rounded-full bg-black/10 dark:bg-white/15">
          <Slider.Range className="absolute h-full rounded-full bg-[var(--color-accent)]" />
        </Slider.Track>
        <Slider.Thumb
          aria-label="Minimum price"
          className="block h-4 w-4 rounded-full border-2 border-[var(--color-accent)] bg-white shadow"
        />
        <Slider.Thumb
          aria-label="Maximum price"
          className="block h-4 w-4 rounded-full border-2 border-[var(--color-accent)] bg-white shadow"
        />
      </Slider.Root>
      <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>{formatPrice(range[0])}</span>
        <span>{formatPrice(range[1])}</span>
      </div>
      {selected && (
        <Button variant="ghost" size="sm" onClick={() => onChange(undefined)} className="h-7 px-2 text-xs">
          Reset
        </Button>
      )}
    </div>
  )
}
