# PLP — Product Listing Page

A Product Listing Page built against the Searchspring search API. The URL is the single source of truth, React Query owns the server cache, and components are presentational and accessible.

## Stack

- **Vite + React 19 + TypeScript (strict)** — the original spec asked for Next.js App Router; the existing scaffold was Vite, so we adapted (see [Trade-offs](#trade-offs)).
- **TanStack Query** for fetching, caching, dedup, retries, `keepPreviousData`, and `useInfiniteQuery` for the infinite-scroll mode.
- **React Router v6** with `useSearchParams` driving all filter / sort / page / query state in the URL.
- **Tailwind CSS v4** + a handful of **Radix UI** primitives (Dialog, Select, Slider, Checkbox, Collapsible) for accessible behaviour without dictating visuals.
- **Hand-written TS types + a small `normalizeResponse()`** at the API boundary. The Searchspring response returns numeric strings (`"22"`), bucketed facet values without a `value` field, and booleans encoded as `0`/`1` — we coerce once and the rest of the codebase sees clean typed data. No runtime schema library.
- **Manrope** as the global font, loaded from Google Fonts with `preconnect` + `display=swap` so first paint isn't blocked.
- **Vitest + React Testing Library + userEvent** for unit and component tests. The test API (`describe`/`it`/`expect`/`vi.fn()`) is Jest-compatible — files would run on a Jest runner unchanged.

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
      WishlistPanel.tsx        Right-side wishlist drawer (lazy chunk)
      ActiveFilterPills.tsx
      ResultsHeader.tsx        Result count + sort + view-mode toggle + wishlist
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
      useWishlist.ts           localStorage-backed wishlist (cross-tab synced)
      useDebouncedValue.ts
      useMediaQuery.ts
    utils/
      format.ts                Currency / count formatting
  test/
    setup.ts                   jest-dom + matchMedia polyfill
    ProductCard.test.tsx
    useSearchState.test.tsx
    searchspring.test.ts
    useWishlist.test.tsx
    Pagination.test.tsx
  styles/globals.css           Tokens + Manrope + native search-input clear hidden
```

### Design choices

- **URL is the single source of truth** for `q`, `page`, `sort`, and filters. Refresh and share both restore exact state. `useSearchState` is the only place that reads or writes URL params, so the parsing rules are auditable in one file.
- **View mode and wishlist are UI preferences, not URL state.** They live in `localStorage` and are deliberately kept out of the URL so shared links don't dictate someone else's layout or personal saves.
- **No global store.** Server cache → React Query. URL state → URL. UI prefs → `localStorage`. Ephemeral UI (drawer open, image-load) → `useState`. Redux/Zustand would just duplicate one of these.
- **Coerce at the edge.** `normalizeResponse()` turns the API's quirky shapes (strings as numbers, `0`/`1` as booleans, missing `value` on range buckets) into clean typed data. Downstream components see one consistent shape.
- **Side effects live in hooks, not components.** Debounce, URL sync, media queries, wishlist persistence — all isolated. Components stay pure and testable.
- **Wishlist state lifts to the route, not the card.** If every `ProductCard` subscribed to the wishlist hook, every toggle would re-render every card on the page. The route owns the hook; cards take `isWishlisted` + `onToggleWishlist` as props.

## Features

| Feature | Where |
| --- | --- |
| Debounced live search (300ms) + Enter submit + clear button (native search × is hidden via CSS) | `SearchBar`, `globals.css` |
| Responsive 1→2→3→4→5 grid | `ProductGrid` |
| Blur-up image loading: the small thumbnail fades in first (blurred), then the full image fades in once decoded | `ProductCard` |
| MSRP strikethrough only when `msrp > price`; discount % badge computed from the pair | `ProductCard`, `lib/utils/format.ts` |
| Heart toggle on every card; full-width "Add to cart" button (visual only — no action wired) | `ProductCard` |
| Numbered pagination with ellipsis truncation, `aria-current`, disabled prev/next with `aria-disabled`/`tabIndex=-1`, scroll-to-top respecting `prefers-reduced-motion` | `Pagination`, `plp.tsx` |
| **Infinite-scroll mode** with IntersectionObserver sentinel (300px rootMargin), accumulating pages via `useInfiniteQuery`, end-of-results message | `LoadMoreTrigger`, `plp.tsx` |
| Paginated ↔ Infinite toggle in the header, persisted in `localStorage` | `ResultsHeader`, `useViewMode` |
| **Wishlist** — heart on cards, header button with counter, right-side panel (lazy chunk) with focus trap + `Esc`, per-item remove + clear all, persisted across reloads and tabs | `useWishlist`, `WishlistPanel`, `ProductCard` |
| Sort options rendered **dynamically from `sorting.options`** in the API response; URL stores `sort=<field>:<dir>`; resets page to 1 | `SortDropdown`, `searchspring.ts` |
| Facets rendered **dynamically** (no hardcoded names): checkbox lists + a two-thumb price range slider with min/max derived from the catalog's bucket extents; collapsible sections remembered per session in `sessionStorage` | `FilterSidebar`, `FilterSection`, `PriceRangeFilter` |
| Price slider commits via `onValueCommit` (pointer release) so a drag doesn't fire 50 requests; live local state during the drag | `PriceRangeFilter` |
| Range filters stored compactly in the URL as `low:high`; unpacked to Searchspring's `filter.<field>.low` / `.high` shape by the URL builder | `searchspring.ts` |
| Hidden / re-labelled facets via small maps in `plp.tsx` (e.g. hide `condition` and `color`; surface `color_family` under the label "Color") | `plp.tsx` |
| Active filter pills, keyboard-accessible, **price ranges formatted** as `$20 – $310` / `From $X` / `Up to $X` instead of the raw `low:high` | `ActiveFilterPills` |
| Sticky desktop sidebar; lazy-loaded mobile bottom-sheet drawer with Radix Dialog (focus trap + `Esc`) | `FilterSidebar`, `FilterDrawer` (its own chunk) |
| Loading skeletons that match card dimensions; faceted skeleton on first load | `ProductCardSkeleton`, `FilterSidebar` |
| Empty state with clear-filters / clear-search actions; error state with retry that re-invokes the query | `EmptyState`, `ErrorState` |
| `aria-live="polite"` result-count announcer | `ResultsAnnouncer` |
| Document title reflects current query + result count | `plp.tsx` effect |
| Page-number-out-of-range URL → clamps to last page | `plp.tsx` effect |

## Trade-offs

- **Vite instead of Next.js.** The spec specified Next.js 14 App Router, but the existing scaffold was Vite + React 19. Per user direction we stayed on Vite. Functional consequences:
  - No SSR / RSC: first paint is a skeleton, not server-rendered cards. This costs LCP and SEO.
  - No `next/image`: I use native `<img loading="lazy" decoding="async">` plus a thumbnail-as-placeholder blur-up. Lose automatic AVIF/WebP and `srcSet` — fine here since the API only serves jpgs and one resolution per size tier.
  - `error.tsx` / `loading.tsx` → React Router `errorElement` + `<Suspense>` boundaries instead.
- **No Zod / no runtime schema validation.** Originally I had Zod parsing at the API boundary; I removed it during simplification. The trade: API drift now surfaces as `undefined` access errors rather than a clean ParseError. The `normalizeResponse()` function covers the *known* quirks (numeric strings, 0/1 booleans, range buckets without a `value`); anything outside that is on the consumer to handle.
- **Sort is dynamic, including its labels.** Initially I hardcoded a UI list. Inspecting a real response showed the catalog returns its own (`Best Sellers`, `Price ($$$ - $)`, `Recently Added`, `Name (A-Z)`, "Highest Rated"…), so the dropdown now renders whatever `sorting.options` the response includes. Works for any catalog. Side effect: catalog config bugs (e.g. "Highest Rated" maps to `sale_price desc` on this demo site) surface in the UI — the fix belongs in Searchspring's admin, not the frontend.
- **Two of the API's facets are intentionally hidden** (`condition`, `color`) via a small set in `plp.tsx`. `color_family` (the grouped colour facet) is surfaced under the label "Color" — the actual API field stays `color_family` so the backend doesn't care about the rename.
- **View mode and wishlist in `localStorage`, not URL.** Both are personal preferences, not part of the search query.
- **"Add to cart" button is visual only.** Cart is not in the spec's required features (only search/PLP/pagination/sort/filter/state/a11y/perf are). The button demonstrates how a real action would be wired in without overscoping the take-home.
- **Light theme only.** Earlier iterations included `prefers-color-scheme` dark tokens; removed at request to keep the surface area smaller.

## What I'd add with more time

- **Virtualization** (TanStack Virtual / react-window) for the infinite-scroll grid. It's fine at 4K products; past ~20K accumulated cards it'd get sluggish.
- **SSR / RSC** if SEO and LCP mattered — would mean migrating to Next.js, exactly what the spec originally asked for.
- **Error boundaries below the route level**, so a render error in one leaf doesn't take down the whole page.
- **Web Vitals telemetry** + Sentry for real-user perf and error tracking.
- **A small `<Image>` wrapper** with `srcSet` / `<picture>` once the API exposes multiple image sizes.
- **Hierarchical facets** (categories) — current implementation flattens them.
- **i18n**: `formatPrice` is hardcoded to `Intl.NumberFormat('en-US')`. Real multi-region app would inject a locale.
- **Playwright e2e** covering the search → filter → paginate → infinite-toggle → wishlist flow end-to-end.

## Known limitations

- **No e2e tests.** Unit and component tests only.
- **No virtualization in infinite mode.** Memory grows linearly with pages loaded.
- **No SSR.** Skeleton on first paint.
- **USD-locked currency formatting.**
- **Switching view mode triggers a refetch** (different query key for the infinite cache). Acceptable; sharing cache between modes would add complexity for marginal gain.
- **Wishlist stores full Product objects in `localStorage`** (not just UIDs), so the panel can render after navigating away. Trade-off: bigger storage payload, but well within the 5 MB cap.

## Tests

```bash
npm test            # 31 tests across 5 files
```

- [`ProductCard.test.tsx`](src/test/ProductCard.test.tsx) — render variants: no MSRP, MSRP > price, MSRP <= price, missing image.
- [`useSearchState.test.tsx`](src/test/useSearchState.test.tsx) — URL parsing, defaults, `setQuery` resets page to 1, filter toggle add/remove, `clearAllFilters` preserves non-filter params, malformed sort values are ignored.
- [`searchspring.test.ts`](src/test/searchspring.test.ts) — `buildSearchUrl` correctness: siteId/resultsFormat always present, page=1 omitted, sort encoding + malformed guard, multi-value filters, `low:high` range unpacking including open-ended (`20:`, `:310`).
- [`useWishlist.test.tsx`](src/test/useWishlist.test.tsx) — empty initial state, toggle add/remove, persistence across hook instances, single-item remove, clear, corrupt-storage fallback.
- [`Pagination.test.tsx`](src/test/Pagination.test.tsx) — hidden when ≤1 page, full numeric list when ≤7 pages, ellipsis when >7, `aria-current` on the current page, disabled edges with `aria-disabled`/`tabindex=-1`, click → correct `onPageChange` argument.
