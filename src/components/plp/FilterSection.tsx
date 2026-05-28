import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'plp.facetCollapse'

function readCollapseMap(): Record<string, boolean> {
  if (typeof sessionStorage === 'undefined') return {}
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeCollapseMap(map: Record<string, boolean>) {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    /* noop */
  }
}

export interface FilterSectionProps {
  id: string
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

export function FilterSection({ id, title, defaultOpen = true, children }: FilterSectionProps) {
  const [open, setOpen] = useState<boolean>(() => {
    const map = readCollapseMap()
    return id in map ? map[id]! : defaultOpen
  })

  useEffect(() => {
    const map = readCollapseMap()
    map[id] = open
    writeCollapseMap(map)
  }, [id, open])

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className="border-b border-[var(--color-border)] py-3">
      <Collapsible.Trigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between text-sm font-medium"
          aria-label={`${open ? 'Collapse' : 'Expand'} ${title} filter`}
        >
          <span>{title}</span>
          <ChevronDown
            aria-hidden="true"
            className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content className="overflow-hidden data-[state=open]:pt-3">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
