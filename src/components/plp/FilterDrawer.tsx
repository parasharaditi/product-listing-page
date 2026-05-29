import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilterSidebar, type FilterSidebarProps } from './FilterSidebar'

export interface FilterDrawerProps extends FilterSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClearAll: () => void
  resultCount: number
}

export default function FilterDrawer({
  open,
  onOpenChange,
  onClearAll,
  resultCount,
  ...sidebarProps
}: FilterDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl bg-[var(--color-bg)] shadow-xl focus:outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
            <Dialog.Title className="text-base font-semibold">Filters</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close filters"
                className="rounded p-1 hover:bg-black/5"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-4">
            <FilterSidebar {...sidebarProps} />
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--color-border)] p-4">
            <Button variant="outline" className="flex-1" onClick={onClearAll}>
              Clear all
            </Button>
            <Button className="flex-1" onClick={() => onOpenChange(false)}>
              Show {resultCount} results
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
