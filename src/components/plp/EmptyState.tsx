import { PackageSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface EmptyStateProps {
  query: string
  hasActiveFilters: boolean
  onClearFilters: () => void
  onClearSearch: () => void
}

export function EmptyState({ query, hasActiveFilters, onClearFilters, onClearSearch }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] py-16 text-center">
      <PackageSearch aria-hidden="true" className="h-12 w-12 text-[var(--color-muted)]" />
      <h2 className="mt-4 text-lg font-semibold">No products found</h2>
      <p className="mt-1 max-w-md text-sm text-[var(--color-muted)]">
        {query ? <>We couldn't find anything matching &ldquo;{query}&rdquo;.</> : 'Try removing filters or searching with different terms.'}
      </p>
      <div className="mt-4 flex gap-2">
        {hasActiveFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
        {query && (
          <Button onClick={onClearSearch}>Clear search</Button>
        )}
      </div>
    </div>
  )
}
