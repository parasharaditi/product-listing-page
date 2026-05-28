// Shape of the Searchspring search.json response we actually use.
// Hand-written TS types (not generated). The normalizer in searchspring.ts
// converts the API's numeric strings to numbers and fills sensible defaults.

export interface Product {
  uid: string
  name: string
  url?: string
  imageUrl?: string
  thumbnailImageUrl?: string
  price: number
  msrp?: number
  brand?: string
  description?: string
}

export interface FacetValue {
  /** For list/swatch facets. Range buckets have low/high instead — we synthesize "low:high". */
  value?: string
  label?: string
  count?: number
  hex?: string
  swatchImageUrl?: string
  low?: number
  high?: number
}

export interface Facet {
  field: string
  label?: string
  type: 'list' | 'range' | 'slider' | 'range-buckets' | 'hierarchy' | 'grid' | 'palette'
  values: FacetValue[]
  min?: number
  max?: number
  step?: number
}

export interface SortOption {
  field: string
  direction?: 'asc' | 'desc'
  label?: string
}

export interface Pagination {
  totalResults: number
  currentPage: number
  perPage: number
  totalPages: number
}

export interface SearchResponse {
  results: Product[]
  pagination: Pagination
  facets: Facet[]
  sorting: { options: SortOption[] }
}
