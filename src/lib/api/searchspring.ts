import type { Facet, FacetValue, Product, SearchResponse } from './types'

const BASE_URL = 'https://api.searchspring.net/api/search/search.json'
const SITE_ID = 'scmq7n'

export type SearchParams = {
  q?: string
  page?: number
  resultsPerPage?: number
  /** "<field>:<asc|desc>" — matches the API's own sorting.options. Empty = catalog default. */
  sort?: string
  /** filter.<field> => string[]. Range values use "low:high" form. */
  filters?: Record<string, string[]>
}

export function buildSearchUrl(params: SearchParams): string {
  const url = new URL(BASE_URL)
  url.searchParams.set('siteId', SITE_ID)
  url.searchParams.set('resultsFormat', 'native')

  if (params.q != null) url.searchParams.set('q', params.q)
  if (params.page && params.page > 1) url.searchParams.set('page', String(params.page))
  if (params.resultsPerPage) {
    url.searchParams.set('resultsPerPage', String(params.resultsPerPage))
  }

  if (params.sort) {
    const [field, direction] = params.sort.split(':')
    if (field && (direction === 'asc' || direction === 'desc')) {
      url.searchParams.set(`sort.${field}`, direction)
    }
  }

  if (params.filters) {
    for (const [field, values] of Object.entries(params.filters)) {
      for (const v of values) {
        if (!v) continue
        // Range filters stored as "low:high" → Searchspring expects .low / .high.
        const range = /^(-?\d+(?:\.\d+)?)?:(-?\d+(?:\.\d+)?)?$/.exec(v)
        if (range) {
          const [, lo, hi] = range
          if (lo) url.searchParams.set(`filter.${field}.low`, lo)
          if (hi) url.searchParams.set(`filter.${field}.high`, hi)
        } else {
          url.searchParams.append(`filter.${field}`, v)
        }
      }
    }
  }

  return url.toString()
}

// --- Normalizer ---------------------------------------------------------
// The API returns numeric strings ("22"), booleans as 0/1, and bucketed
// facet values with `low`/`high` but no `value`. Coerce here so downstream
// code sees clean typed data.

function num(v: unknown): number | undefined {
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined
}

function normalizeProduct(raw: any): Product {
  return {
    uid: String(raw.uid ?? raw.id ?? ''),
    name: str(raw.name) ?? 'Untitled product',
    url: str(raw.url),
    imageUrl: str(raw.imageUrl),
    thumbnailImageUrl: str(raw.thumbnailImageUrl),
    price: num(raw.price) ?? 0,
    msrp: num(raw.msrp),
    brand: str(raw.brand),
    description: str(raw.description),
  }
}

function normalizeFacetValue(raw: any): FacetValue {
  const low = num(raw.low)
  const high = num(raw.high)
  let value = raw.value != null ? String(raw.value) : undefined
  if (value == null && (low != null || high != null)) {
    value = `${low ?? ''}:${high ?? ''}`
  }
  return {
    value,
    label: str(raw.label),
    count: num(raw.count),
    hex: str(raw.hex),
    swatchImageUrl: str(raw.swatchImageUrl),
    low,
    high,
  }
}

function normalizeFacet(raw: any): Facet {
  return {
    field: String(raw.field),
    label: str(raw.label),
    type: (raw.type as Facet['type']) ?? 'list',
    values: Array.isArray(raw.values) ? raw.values.map(normalizeFacetValue) : [],
    min: num(raw.min),
    max: num(raw.max),
    step: num(raw.step),
  }
}

function normalizeResponse(raw: any): SearchResponse {
  return {
    results: Array.isArray(raw?.results) ? raw.results.map(normalizeProduct) : [],
    pagination: {
      totalResults: num(raw?.pagination?.totalResults) ?? 0,
      currentPage: num(raw?.pagination?.currentPage) ?? 1,
      perPage: num(raw?.pagination?.perPage) ?? 24,
      totalPages: num(raw?.pagination?.totalPages) ?? 0,
    },
    facets: Array.isArray(raw?.facets) ? raw.facets.map(normalizeFacet) : [],
    sorting: {
      options: Array.isArray(raw?.sorting?.options) ? raw.sorting.options : [],
    },
  }
}

export async function searchProducts(
  params: SearchParams,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const res = await fetch(buildSearchUrl(params), { signal })
  if (!res.ok) {
    throw new Error(`Search API returned ${res.status}`)
  }
  const json = await res.json()
  return normalizeResponse(json)
}
