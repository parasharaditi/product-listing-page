import { Infinity as InfinityIcon, List, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SortDropdown } from './SortDropdown'
import type { SortValue } from '@/lib/hooks/useSearchState'
import type { ViewMode } from '@/lib/hooks/useViewMode'
import type { SortOption } from '@/lib/api/types'
import { formatCount } from '@/lib/utils/format'

export interface ResultsHeaderProps {
  totalResults: number
  query: string
  loading?: boolean
  sort: SortValue
  sortOptions: SortOption[]
  onSortChange: (s: SortValue) => void
  onOpenMobileFilters?: () => void
  showMobileFilters?: boolean
  activeFilterCount?: number
  viewMode: ViewMode
  onViewModeChange: (m: ViewMode) => void
}

export function ResultsHeader({
  totalResults,
  query,
  loading,
  sort,
  sortOptions,
  onSortChange,
  onOpenMobileFilters,
  showMobileFilters,
  activeFilterCount = 0,
  viewMode,
  onViewModeChange,
}: ResultsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">
          {query ? <>Results for &ldquo;{query}&rdquo;</> : 'All products'}
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          {loading ? 'Loading…' : `${formatCount(totalResults)} ${totalResults === 1 ? 'result' : 'results'}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {showMobileFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={onOpenMobileFilters}
            className="md:hidden"
          >
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-[var(--color-accent)] px-1.5 text-xs text-[var(--color-accent-fg)]">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}

        <div
          role="group"
          aria-label="View mode"
          className="inline-flex h-10 overflow-hidden rounded-md border border-[var(--color-border)]"
        >
          <button
            type="button"
            aria-pressed={viewMode === 'pages'}
            aria-label="Paginated view"
            onClick={() => onViewModeChange('pages')}
            className={`flex h-full w-10 items-center justify-center transition-colors ${
              viewMode === 'pages'
                ? 'bg-[var(--color-accent)] text-[var(--color-accent-fg)]'
                : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <List aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-pressed={viewMode === 'infinite'}
            aria-label="Infinite scroll view"
            onClick={() => onViewModeChange('infinite')}
            className={`flex h-full w-10 items-center justify-center transition-colors ${
              viewMode === 'infinite'
                ? 'bg-[var(--color-accent)] text-[var(--color-accent-fg)]'
                : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <InfinityIcon aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <SortDropdown value={sort} options={sortOptions} onChange={onSortChange} />
      </div>
    </div>
  )
}
