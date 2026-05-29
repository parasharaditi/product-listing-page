
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
