import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import type { SortOption } from '@/lib/api/types'
import type { SortValue } from '@/lib/hooks/useSearchState'

export interface SortDropdownProps {
  value: SortValue
  options: SortOption[]
  onChange: (value: SortValue) => void
}

const DEFAULT_VALUE = '__default__'

function toValue(opt: SortOption): string {
  return opt.direction ? `${opt.field}:${opt.direction}` : opt.field
}

export function SortDropdown({ value, options, onChange }: SortDropdownProps) {

  const selectValue = value === '' ? DEFAULT_VALUE : value
  return (
    <Select.Root
      value={selectValue}
      onValueChange={(v) => onChange(v === DEFAULT_VALUE ? '' : v)}
    >
      <Select.Trigger
        aria-label="Sort by"
        className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm hover:bg-black/5"
      >
        <span className="text-[var(--color-muted)]">Sort:</span>
        <Select.Value placeholder="Relevance" />
        <Select.Icon>
          <ChevronDown aria-hidden="true" className="h-4 w-4" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={4}
          className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] shadow-md"
        >
          <Select.Viewport className="p-1">
            <Select.Item
              value={DEFAULT_VALUE}
              className="relative flex cursor-pointer select-none items-center gap-2 rounded px-7 py-1.5 text-sm outline-none data-[highlighted]:bg-black/5"
            >
              <Select.ItemIndicator className="absolute left-2">
                <Check aria-hidden="true" className="h-3.5 w-3.5" />
              </Select.ItemIndicator>
              <Select.ItemText>Relevance</Select.ItemText>
            </Select.Item>
            {options.map((opt) => {
              const v = toValue(opt)
              return (
                <Select.Item
                  key={v}
                  value={v}
                  className="relative flex cursor-pointer select-none items-center gap-2 rounded px-7 py-1.5 text-sm outline-none data-[highlighted]:bg-black/5"
                >
                  <Select.ItemIndicator className="absolute left-2">
                    <Check aria-hidden="true" className="h-3.5 w-3.5" />
                  </Select.ItemIndicator>
                  <Select.ItemText>{opt.label ?? `${opt.field} ${opt.direction ?? ''}`}</Select.ItemText>
                </Select.Item>
              )
            })}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
