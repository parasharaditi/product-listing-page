# PLP — Product Listing Page

A Product Listing Page built against the Searchspring search API. The URL is the single source of truth, React Query owns the server cache, and components are presentational and accessible.

## Stack

- **Vite + React 19 + TypeScript (strict)** — the original spec asked for Next.js App Router; the existing scaffold was Vite, so we adapted (see [Trade-offs](#trade-offs)).
- **TanStack Query** for fetching, caching, dedup, retries, `keepPreviousData`, and `useInfiniteQuery` for the infinite-scroll mode.
- **React Router v6** with `useSearchParams` driving all filter / sort / page / query state in the URL.
- **Tailwind CSS v4** + a handful of **Radix UI** primitives (Dialog, Select, Slider, Checkbox, Collapsible) for accessible behaviour without dictating visuals.
- **Hand-written TS types + a small `normalizeResponse()`** function at the API boundary. The Searchspring response returns numeric strings (`"22"`), bucketed facet values without a `value` field, and booleans encoded as `0`/`1` — we coerce once and the rest of the codebase sees clean typed data. No runtime schema library.
- **Vitest + React Testing Library** for unit tests.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc + vite build (also validates types)
npm run typecheck
npm test             # vitest run
```

## Architecture

```
src/
  main.tsx                     React Query + Router providers
  routes/
    plp.tsx                    Composed PLP page (URL state, queries, layout)
    error-boundary.tsx         Route-level error boundary
  components/
    plp/                       Feature components
      SearchBar.tsx
      ProductGrid.tsx          + ProductCard, ProductCardSkeleton
      Pagination.tsx           Paginated-mode controls
      LoadMoreTrigger.tsx      Infinite-scroll sentinel (IntersectionObserver)
      SortDropdown.tsx
      FilterSidebar.tsx        + FilterSection, PriceRangeFilter
      FilterDrawer.tsx         Mobile bottom-sheet (lazy chunk)
      ActiveFilterPills.tsx
      ResultsHeader.tsx        Result count + sort + view-mode toggle
      ResultsAnnouncer.tsx     aria-live region
      EmptyState.tsx
      ErrorState.tsx
    ui/                        shadcn-style primitives — Button, Input, Badge, Skeleton
  lib/
    api/
      searchspring.ts          searchProducts() + buildSearchUrl() + normalizeResponse()
      types.ts                 Hand-written TS interfaces
    hooks/
      useSearchState.ts        URL <-> typed state bridge
      useViewMode.ts           localStorage-backed pages|infinite preference
      useDebouncedValue.ts
      useMediaQuery.ts
    utils/
      format.ts                Currency / count formatting
  test/
    setup.ts                   jest-dom + matchMedia polyfill
    ProductCard.test.tsx
    useSearchState.test.tsx
  styles/globals.css
```

### Design choices

- **URL is the single source of truth** for `q`, `page`, `sort`, and filters. Refresh and share both restore exact state. `useSearchState` is the only place that reads or writes URL params, so the parsing rules are auditable in one file.
- **View mode is the one exception** — `pages` vs `infinite` is a UI preference, not part of the query, so it lives in `localStorage` and is *deliberately* kept out of the URL (so shared links don't dictate someone else's layout).
- **No global store.** Server cache → React Query. URL state → URL. Ephemeral UI (drawer open, image-load) → `useState`. Redux/Zustand would just duplicate one of these.
- **Coerce at the edge.** `normalizeResponse()` turns the API's quirky shapes (strings as numbers, `0`/`1` as booleans, missing `value` on range buckets) into clean typed data. Downstream components see one consistent shape.
- **Side effects live in hooks, not components.** Debounce, URL sync, media queries, view-mode persistence — all isolated. Components stay pure and testable.

## Features

| Feature | Where |
| --- | --- |
| Debounced live search + Enter submit + clear button | `SearchBar` |
| Responsive 1→2→3→4→5 grid | `ProductGrid` |
| Blur-up image loading: thumbnail fades in first (blurred), then the full image fades in once decoded | `ProductCard` |
| MSRP strikethrough only when `msrp > price`; discount % badge computed from the pair | `ProductCard`, `lib/utils/format.ts` |
| Numbered pagination with ellipsis truncation, `aria-current`, disabled prev/next with `aria-disabled`/`tabIndex=-1`, scroll-to-top respecting `prefers-reduced-motion` | `Pagination`, `plp.tsx` |
| **Infinite-scroll mode** with IntersectionObserver sentinel, accumulating pages via `useInfiniteQuery`, end-of-results message | `LoadMoreTrigger`, `plp.tsx` |
| Paginated ↔ Infinite toggle in the header, persisted in `localStorage` | `ResultsHeader`, `useViewMode` |
| Sort options rendered **dynamically from `sorting.options`** in the API response; URL stores `sort=<field>:<dir>`; resets page to 1 | `SortDropdown`, `searchspring.ts` |
| Facets rendered **dynamically** (no hardcoded names): checkbox lists + a two-thumb price range slider; collapsible sections remembered per session in `sessionStorage` | `FilterSidebar`, `FilterSection`, `PriceRangeFilter` |
| Range filters in the URL stored compactly as `low:high`; unpacked to Searchspring's `filter.<field>.low` / `.high` shape by the URL builder | `searchspring.ts` |
| Hidden / re-labelled facets via a small map in `plp.tsx` (e.g. hide `condition`, surface `color_family` as "Color") | `plp.tsx` |
| Active filter pills (keyboard-accessible) + Clear all | `ActiveFilterPills` |
| Sticky desktop sidebar; lazy-loaded mobile bottom-sheet drawer with Radix Dialog (focus trap + `Esc`) | `FilterSidebar`, `FilterDrawer` (its own chunk) |
| Loading skeletons that match card dimensions; faceted skeleton on first load | `ProductCardSkeleton`, `FilterSidebar` |
| Empty state with clear-filters / clear-search actions; error state with retry that re-invokes the query | `EmptyState`, `ErrorState` |
| `aria-live="polite"` result-count announcer | `ResultsAnnouncer` |
| Document title reflects current query + result count | `plp.tsx` effect |
| Page-number-out-of-range URL → clamps to last page | `plp.tsx` effect |
| Dark-mode tokens via `prefers-color-scheme` | `globals.css` |

## Trade-offs

- **Vite instead of Next.js.** The spec specified Next.js 14 App Router, but the existing scaffold was Vite + React 19. Per user direction we stayed on Vite. Functional consequences:
  - No SSR / RSC: first paint is a skeleton, not server-rendered cards. This costs LCP and SEO.
  - No `next/image`: I use native `<img loading="lazy" decoding="async">` plus a thumbnail-as-placeholder blur-up. Lose automatic AVIF/WebP and `srcSet` — fine here since the API only serves jpgs and one resolution per size tier.
  - `error.tsx` / `loading.tsx` → React Router `errorElement` + `<Suspense>` boundaries instead.
- **No Zod / no runtime schema validation.** Originally I had Zod parsing at the API boundary; I removed it during simplification. The trade: API drift now surfaces as `undefined` access errors rather than a clean ParseError. The `normalizeResponse()` function covers the *known* quirks (numeric strings, 0/1 booleans, range buckets without a `value`); anything outside that is on the consumer to handle.
- **Sort options are dynamic.** Initially I hardcoded a list. Inspecting a real response showed the catalog returns its own (`Best Sellers`, `Price ($$$ - $)`, `Recently Added`, `Name (A-Z)`…), so the dropdown now renders whatever `sorting.options` the response includes. Works for any catalog.
- **Two of the API's facets are intentionally hidden** (`condition`, `color`) via a small set in `plp.tsx`. `color_family` (the grouped colour facet) is surfaced under the label "Color" — the actual API field stays `color_family` so the backend doesn't care about the rename.
- **View mode in `localStorage`, not URL.** Discussed above — UI preference, not query state.

## What I'd add with more time

- **Virtualization** (TanStack Virtual / react-window) for the infinite-scroll grid. It's fine at 4K products; past ~20K accumulated cards it'd get sluggish.
- **SSR / RSC** if SEO and LCP mattered — would mean migrating to Next.js, exactly what the spec originally asked for.
- **Error boundaries below the route level**, so a render error in one leaf doesn't take down the whole page.
- **Web Vitals telemetry** + Sentry for real-user perf and error tracking.
- **A small `<Image>` wrapper** with `srcSet` / `<picture>` once the API exposes multiple image sizes.
- **Hierarchical facets** (categories) — current implementation flattens them.
- **i18n**: `formatPrice` is hardcoded to `Intl.NumberFormat('en-US')`. Real multi-region app would inject a locale.
- **Playwright e2e** covering the search → filter → paginate → infinite-toggle flow end-to-end.

## Known limitations

- **No e2e tests.** Only unit tests for the two non-trivial pieces — `ProductCard` rendering variants and `useSearchState` URL parsing.
- **No virtualization in infinite mode.** Memory grows linearly with pages loaded.
- **No SSR.** Skeleton on first paint.
- **USD-locked currency formatting.**
- **Switching view mode triggers a refetch** (different query key for the infinite cache). Acceptable; sharing cache between modes would add complexity for marginal gain.

## Tests

```bash
npm test            # 10 tests across 2 files
```

- [`ProductCard.test.tsx`](src/test/ProductCard.test.tsx) — render variants: no MSRP, MSRP > price, MSRP <= price, missing image.
- [`useSearchState.test.tsx`](src/test/useSearchState.test.tsx) — URL parsing, defaults, `setQuery` resets page to 1, filter toggle add/remove, `clearAllFilters` preserves non-filter params, malformed sort values are ignored.
