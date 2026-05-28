# PLP — Product Listing Page

A production-grade Product Listing Page built against the Searchspring search API. The URL is the single source of truth; React Query owns the server cache; components are presentational and accessible.

## Stack

- **Vite + React 19 + TypeScript (strict)** — the spec asked for Next.js App Router; the existing scaffold was Vite, so we adapted (see Trade-offs).
- **TanStack Query** for fetching, caching, dedup, retries, and `keepPreviousData` so filter/page changes don't flash skeletons.
- **React Router v6** with `useSearchParams` driving all filter / sort / page / query state in the URL.
- **Tailwind CSS v4** + a handful of **Radix UI** primitives (Dialog, Select, Slider, Checkbox, Collapsible) for accessible behaviour.
- **Hand-written TS types** with a small `normalizeResponse()` function — the API returns numeric strings (`"22"`) and bucketed facet values without a `value` field, so we coerce at the boundary. No runtime schema library.
- **Vitest + RTL** for unit tests.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc + vite build (validates types)
npm run typecheck
npm test             # vitest run
```

## Architecture

```
src/
  main.tsx                 React Query + Router providers
  routes/
    plp.tsx                Composed PLP page
    error-boundary.tsx     Route-level error boundary
  components/
    plp/                   PLP feature components
    ui/                    Small shadcn-style primitives (Button, Input, …)
  lib/
    api/
      searchspring.ts      Typed client (searchProducts + URL builder + normalizer)
      types.ts             Hand-written TS interfaces
    hooks/
      useSearchState.ts    URL <-> typed state bridge
      useDebouncedValue.ts
      useMediaQuery.ts
    utils/
      format.ts            Currency / count formatting
      cn.ts                clsx + tailwind-merge
  test/
    setup.ts               jest-dom + MSW
    msw/                   Mocked Searchspring responses
    *.test.{ts,tsx}        Unit + integration tests
  styles/globals.css
```

### Why this shape

- **URL as source of truth.** Refresh and share restore exact state. `useSearchState` is the only place that reads or writes URL params, so the parsing rules are auditable in one file.
- **No global store.** Filters/sort/page/q live in the URL; server cache lives in React Query; ephemeral UI (drawer open) lives in `useState`. Adding Redux/Zustand here would just duplicate one of those.
- **Schema at the edge.** Every API response is parsed with Zod (`.catch()` + `.passthrough()` for defensive parsing), and downstream code consumes the inferred types. Malformed fields fall back to sensible defaults rather than crashing the page.
- **Components stay presentational.** All side effects (debouncing, URL sync, media queries, prefetching) live in hooks. This keeps tests cheap — see `ProductCard.test.tsx`.

## Features covered

| Feature | Where |
| --- | --- |
| Debounced live search + Enter submit + clear button | `SearchBar` |
| Responsive 1→2→3→4→5 grid, lazy images, blur/fallback, discount badge, MSRP strikethrough only when `msrp > price` | `ProductGrid`, `ProductCard` |
| Numbered pagination with ellipsis truncation, `aria-current`, disabled prev/next, prefetch on Next hover, scroll-to-top respecting `prefers-reduced-motion` | `Pagination`, `plp.tsx` |
| Sort dropdown rendered **dynamically from `sorting.options` in the API response**; URL stores `sort=<field>:<dir>`; resets page to 1 | `SortDropdown`, `searchspring.ts` |
| Facets rendered dynamically (no hardcoded names) with checkbox lists, color swatches, price range slider; collapsible sections remembered per session | `FilterSidebar`, `FilterSection`, `ColorSwatchFilter`, `PriceRangeFilter` |
| Active filter pills (keyboard-accessible) + Clear all | `ActiveFilterPills` |
| Sticky desktop sidebar; lazy-loaded mobile bottom-sheet drawer with focus trap and `Esc` | `FilterSidebar`, `FilterDrawer` (lazy chunk) |
| Loading skeletons matching final card dimensions, faceted skeleton on first load | `ProductCardSkeleton`, `FilterSidebar` |
| Empty state with retry suggestions; error state with retry button that re-invokes the query | `EmptyState`, `ErrorState` |
| `aria-live="polite"` result-count announcer | `ResultsAnnouncer` |
| Document title reflects current query + result count | `plp.tsx` effect |
| Page-number-out-of-range URL → clamps to last page | `plp.tsx` effect |
| Dark-mode tokens via `prefers-color-scheme` | `globals.css` |

## Trade-offs

- **Vite instead of Next.js.** The spec specifies Next.js 14 App Router, but the existing scaffold is Vite + React 19. Per user direction we stayed on Vite. The functional consequences:
  - No Server Components / RSC: first paint is a skeleton rather than server-rendered cards.
  - No `next/image`: I use native `<img loading="lazy" decoding="async">` with intrinsic dimensions and a fallback. Lose automatic `srcSet` / AVIF — would add a small wrapper given more time.
  - `error.tsx` / `loading.tsx` → React Router `errorElement` + `Suspense` boundaries instead.
- **Sort options come from the API.** Initially I hardcoded a UI list, but inspection of a real response (`siteId=scmq7n`) showed the catalog returns its own labels (`Best Sellers`, `Price ($$$ - $)`, `Recently Added`, `Name (A-Z)`, …). The dropdown now renders whatever `sorting.options` the response includes, and the URL stores `sort=<field>:<dir>` — works for any catalog.
- **Facets:** the demo `search.json` for `siteId=scmq7n` does not return a `facets` array, so the sidebar shows "No filters available". The code is fully facet-agnostic and will render whatever facets the API does return.

## What I'd add with more time

- An integration test that drives the full search → filter → paginate flow with `userEvent` and MSW. The scaffolding (server, handlers) is already in `src/test/msw/`.
- A `searchspring` Zod fixture captured from a real response to lock the schema down.
- Visual regression coverage on `ProductCard` and skeletons (e.g. Chromatic).
- Persist last-used sort across sessions via localStorage as a UX nicety (URL still wins).
- A small `<Image>` wrapper that handles `srcSet` when the API exposes multiple image sizes.
- Hierarchical facets (categories) — current implementation flattens them.

## Known limitations

- Sort options for `newest` and `best-selling` may not produce visible reordering on this demo site (see above).
- The price range slider uses `min`/`max`/`step` from the API; some Searchspring sites return ranges as discrete buckets — those would render as a checkbox list today.
- No e2e tests (Playwright) — only unit + API integration via MSW.

## Tests

```bash
npm test
```

- `ProductCard.test.tsx` — render variants (no MSRP, MSRP > price, MSRP <= price, missing image).
- `useSearchState.test.tsx` — URL parsing, query/sort reset page to 1, filter toggle, clear-all.
- `searchspring.test.ts` — URL builder + MSW-backed integration of the client (success, 500, empty).
