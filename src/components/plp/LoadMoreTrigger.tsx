import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ProductCardSkeleton } from './ProductCardSkeleton'

export interface LoadMoreTriggerProps {
  /** Called when the sentinel scrolls into view. Caller should fetch the next page. */
  onIntersect: () => void
  loading: boolean
  hasMore: boolean
  error: boolean
  onRetry: () => void
}

export function LoadMoreTrigger({
  onIntersect,
  loading,
  hasMore,
  error,
  onRetry,
}: LoadMoreTriggerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore || loading || error) return
    const node = ref.current
    if (!node) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onIntersect()
      },
      { rootMargin: '300px 0px' },
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [hasMore, loading, error, onIntersect])

  if (!hasMore && !loading) {
    return (
      <p className="py-8 text-center text-sm text-[var(--color-muted)]">
        You've reached the end.
      </p>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-sm text-[var(--color-muted)]">Couldn't load more.</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div ref={ref}>
      {loading && (
        <ul
          role="list"
          aria-label="Loading more products"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i}>
              <ProductCardSkeleton />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
