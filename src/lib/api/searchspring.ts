import type { Facet, FacetValue, Product, SearchResponse, SortOption } from './types'

const BASE_URL = 'https://api.searchspring.net/api/search/search.json'
const SITE_ID = 'scmq7n'

export type SearchParams = {
  q?: string
  page?: number
  resultsPerPage?: number
  sort?: string
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

type Raw = Record<string, unknown>

function isObject(v: unknown): v is Raw {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function normalizeProduct(raw: Raw): Product {
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

function normalizeFacetValue(raw: Raw): FacetValue {
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

function normalizeFacet(raw: Raw): Facet {
  return {
    field: String(raw.field),
    label: str(raw.label),
    type: (raw.type as Facet['type']) ?? 'list',
    values: Array.isArray(raw.values)
      ? raw.values.filter(isObject).map(normalizeFacetValue)
      : [],
    min: num(raw.min),
    max: num(raw.max),
    step: num(raw.step),
  }
}

function normalizeResponse(raw: unknown): SearchResponse {
  const root = isObject(raw) ? raw : {}
  const pagination = isObject(root.pagination) ? root.pagination : {}
  const sorting = isObject(root.sorting) ? root.sorting : {}
  return {
    results: Array.isArray(root.results)
      ? root.results.filter(isObject).map(normalizeProduct)
      : [],
    pagination: {
      totalResults: num(pagination.totalResults) ?? 0,
      currentPage: num(pagination.currentPage) ?? 1,
      perPage: num(pagination.perPage) ?? 24,
      totalPages: num(pagination.totalPages) ?? 0,
    },
    facets: Array.isArray(root.facets)
      ? root.facets.filter(isObject).map(normalizeFacet)
      : [],
    sorting: {
      options: Array.isArray(sorting.options) ? (sorting.options as SortOption[]) : [],
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
