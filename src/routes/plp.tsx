import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { SearchBar } from '@/components/plp/SearchBar'
import { ResultsHeader } from '@/components/plp/ResultsHeader'
import { ActiveFilterPills } from '@/components/plp/ActiveFilterPills'
import { ProductGrid } from '@/components/plp/ProductGrid'
import { Pagination } from '@/components/plp/Pagination'
import { FilterSidebar } from '@/components/plp/FilterSidebar'
import { EmptyState } from '@/components/plp/EmptyState'
import { ErrorState } from '@/components/plp/ErrorState'
import { ResultsAnnouncer } from '@/components/plp/ResultsAnnouncer'
import { LoadMoreTrigger } from '@/components/plp/LoadMoreTrigger'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { useViewMode } from '@/lib/hooks/useViewMode'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { useSearchState, RESULTS_PER_PAGE } from '@/lib/hooks/useSearchState'
import { searchProducts } from '@/lib/api/searchspring'
import { Heart } from 'lucide-react'

const FilterDrawer = lazy(() => import('@/components/plp/FilterDrawer'))
const WishlistPanel = lazy(() => import('@/components/plp/WishlistPanel'))

export function PlpRoute() {
  const {
    state,
    setQuery,
    setSort,
    setPage,
    toggleFilter,
    setFilters,
    removeFilter,
    clearAllFilters,
  } = useSearchState()

  const [viewMode, setViewMode] = useViewMode()
  const isInfinite = viewMode === 'infinite'

  // Paginated mode: one query per page.
  const pagedQuery = useQuery({
    queryKey: ['products', state],
    queryFn: ({ signal }) =>
      searchProducts(
        { q: state.q, page: state.page, sort: state.sort, filters: state.filters, resultsPerPage: RESULTS_PER_PAGE },
        signal,
      ),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled: !isInfinite,
  })

  // Infinite mode: one cache entry per query/sort/filters; pages accumulate.
  // Page number is excluded from the key — fetchNextPage drives it instead.
  const infiniteQuery = useInfiniteQuery({
    queryKey: ['products-infinite', { q: state.q, sort: state.sort, filters: state.filters }],
    queryFn: ({ pageParam, signal }) =>
      searchProducts(
        { q: state.q, page: pageParam, sort: state.sort, filters: state.filters, resultsPerPage: RESULTS_PER_PAGE },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    staleTime: 60_000,
    enabled: isInfinite,
  })

  // Unify the two shapes into a single view model so the JSX below doesn't branch.
  const query = isInfinite ? infiniteQuery : pagedQuery
  const data = isInfinite
    ? infiniteQuery.data?.pages[0]
    : pagedQuery.data
  const products = isInfinite
    ? (infiniteQuery.data?.pages.flatMap((p) => p.results) ?? [])
    : (pagedQuery.data?.results ?? [])

  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const wishlist = useWishlist()
  const resultsTopRef = useRef<HTMLDivElement>(null)
  const firstLoadDone = useRef(false)

  // Facets we never want to surface in the UI (Searchspring returns more than we want to show).
  const HIDDEN_FACETS = new Set(['condition', 'color'])
  // Display-name overrides — `color_family` is the swatch-friendly grouped color; we surface it as plain "Color".
  const FACET_LABELS: Record<string, string> = { color_family: 'Color' }
  const facets = (data?.facets ?? [])
    .filter((f) => !HIDDEN_FACETS.has(f.field))
    .map((f) => (FACET_LABELS[f.field] ? { ...f, label: FACET_LABELS[f.field] } : f))
  const sortOptions = data?.sorting?.options ?? []
  const totalResults = data?.pagination.totalResults ?? 0
  const totalPages = data?.pagination.totalPages ?? 0

  // Page clamping only matters in paginated mode.
  useEffect(() => {
    if (isInfinite || !data) return
    if (totalPages > 0 && state.page > totalPages) {
      setPage(totalPages)
    }
  }, [isInfinite, data, totalPages, state.page, setPage])

  // Document title reflects current query + count.
  useEffect(() => {
    const base = state.q ? `"${state.q}"` : 'All products'
    const suffix = data ? ` — ${totalResults} results` : ''
    document.title = `${base}${suffix} | Shop`
  }, [state.q, totalResults, data])

  // Scroll to top of results on page change (paginated mode only).
  useEffect(() => {
    if (isInfinite) return
    if (!firstLoadDone.current) {
      if (data) firstLoadDone.current = true
      return
    }
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    resultsTopRef.current?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.page, isInfinite])

  const activeFilterCount = useMemo(
    () => Object.values(state.filters).reduce((n, vs) => n + vs.length, 0),
    [state.filters],
  )

  const showInitialLoading = query.isLoading && !data
  const isRefetching = query.isFetching && !!data

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6">
      <header className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-tight">
            Product Shop
          </a>
          <button
            type="button"
            onClick={() => setWishlistOpen(true)}
            aria-label={`Open wishlist, ${wishlist.count} items`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--color-border)] transition-colors hover:bg-black/5"
          >
            <Heart aria-hidden="true" className="h-4 w-4" />
            {wishlist.count > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-sale)] px-1 text-[10px] font-semibold text-white"
              >
                {wishlist.count}
              </span>
            )}
          </button>
        </div>
        <SearchBar
          initialValue={state.q}
          onSubmit={(q) => setQuery(q)}
          onLiveChange={(q) => setQuery(q)}
        />
      </header>

      <ResultsAnnouncer
        query={state.q}
        totalResults={totalResults}
        loading={query.isFetching}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <aside className="hidden md:block" aria-label="Filters">
          <div className="sticky top-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Filters
            </h2>
            <FilterSidebar
              facets={facets}
              loading={showInitialLoading}
              selected={state.filters}
              onToggle={toggleFilter}
              onSetField={(field, values) => {
                const next = { ...state.filters }
                if (values.length === 0) delete next[field]
                else next[field] = values
                setFilters(next)
              }}
            />
          </div>
        </aside>

        <main ref={resultsTopRef} className="flex flex-col gap-4">
          <ResultsHeader
            totalResults={totalResults}
            query={state.q}
            loading={showInitialLoading}
            sort={state.sort}
            sortOptions={sortOptions}
            onSortChange={setSort}
            onOpenMobileFilters={() => setDrawerOpen(true)}
            showMobileFilters={!isDesktop}
            activeFilterCount={activeFilterCount}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <ActiveFilterPills
            filters={state.filters}
            facets={facets}
            onRemove={removeFilter}
            onClearAll={clearAllFilters}
          />

          {!isInfinite && totalPages > 1 && (
            <Pagination
              page={state.page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}

          {query.isError ? (
            <ErrorState onRetry={() => query.refetch()} />
          ) : !showInitialLoading && products.length === 0 ? (
            <EmptyState
              query={state.q}
              hasActiveFilters={activeFilterCount > 0}
              onClearFilters={clearAllFilters}
              onClearSearch={() => setQuery('')}
            />
          ) : (
            <div className={isRefetching ? 'opacity-70 transition-opacity' : ''}>
              <ProductGrid
                products={products}
                loading={showInitialLoading}
                isWishlisted={wishlist.isInWishlist}
                onToggleWishlist={wishlist.toggle}
              />
            </div>
          )}

          {!isInfinite && totalPages > 1 && (
            <Pagination
              page={state.page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}

          {isInfinite && !showInitialLoading && products.length > 0 && (
            <LoadMoreTrigger
              onIntersect={() => infiniteQuery.fetchNextPage()}
              loading={infiniteQuery.isFetchingNextPage}
              hasMore={!!infiniteQuery.hasNextPage}
              error={!!infiniteQuery.error && !infiniteQuery.isFetchingNextPage}
              onRetry={() => infiniteQuery.fetchNextPage()}
            />
          )}
        </main>
      </div>

      <Suspense fallback={null}>
        <WishlistPanel
          open={wishlistOpen}
          onOpenChange={setWishlistOpen}
          items={wishlist.items}
          onRemove={wishlist.remove}
          onClear={wishlist.clear}
        />
      </Suspense>

      {!isDesktop && (
        <Suspense fallback={null}>
          <FilterDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            facets={facets}
            loading={showInitialLoading}
            selected={state.filters}
            onToggle={toggleFilter}
            onSetField={(field, values) => {
              const next = { ...state.filters }
              if (values.length === 0) delete next[field]
              else next[field] = values
              setFilters(next)
            }}
            onClearAll={clearAllFilters}
            resultCount={totalResults}
          />
        </Suspense>
      )}
    </div>
  )
}
