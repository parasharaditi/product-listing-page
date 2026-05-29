import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

function buildPageList(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | 'gap')[] = [1]
  const left = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)
  if (left > 2) pages.push('gap')
  for (let p = left; p <= right; p++) pages.push(p)
  if (right < total - 1) pages.push('gap')
  pages.push(total)
  return pages
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null
  const pages = buildPageList(page, totalPages)
  const prevDisabled = page <= 1
  const nextDisabled = page >= totalPages

  const btn =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-[var(--color-border)] px-3 text-sm transition-colors hover:bg-black/5'
  const disabledBtn = 'opacity-40 pointer-events-none'
  const currentBtn =
    'bg-[var(--color-accent)] text-[var(--color-accent-fg)] border-[var(--color-accent)]'

  return (
    <nav aria-label="Pagination" className={`flex items-center justify-center ${className ?? ''}`}>
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          <button
            type="button"
            onClick={() => !prevDisabled && onPageChange(page - 1)}
            aria-label="Previous page"
            aria-disabled={prevDisabled || undefined}
            tabIndex={prevDisabled ? -1 : 0}
            className={`${btn} ${prevDisabled ? disabledBtn : ''}`}
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>
        </li>
        {pages.map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-2 text-[var(--color-muted)]">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Go to page ${p}`}
                className={`${btn} ${p === page ? currentBtn : ''}`}
              >
                {p}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            onClick={() => !nextDisabled && onPageChange(page + 1)}
            aria-label="Next page"
            aria-disabled={nextDisabled || undefined}
            tabIndex={nextDisabled ? -1 : 0}
            className={`${btn} ${nextDisabled ? disabledBtn : ''}`}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </li>
      </ul>
    </nav>
  )
}
