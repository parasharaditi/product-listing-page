import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export const RESULTS_PER_PAGE = 24

/** URL encodes sort as "<field>:<asc|desc>"; empty string = relevance/default. */
export type SortValue = string

export type SearchState = {
  q: string
  page: number
  sort: SortValue
  filters: Record<string, string[]>
}

const RESERVED = new Set(['q', 'page', 'sort'])

function isValidSort(s: string): boolean {
  if (s === '') return true
  const [field, dir] = s.split(':')
  return !!field && (dir === 'asc' || dir === 'desc')
}

function readState(params: URLSearchParams): SearchState {
  const q = params.get('q') ?? ''
  const pageRaw = Number(params.get('page') ?? '1')
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1
  const sortRaw = params.get('sort') ?? ''
  const sort: SortValue = isValidSort(sortRaw) ? sortRaw : ''

  const filters: Record<string, string[]> = {}
  for (const key of params.keys()) {
    if (!key.startsWith('f.')) continue
    const field = key.slice(2)
    if (!field || RESERVED.has(field)) continue
    filters[field] = params.getAll(key).filter(Boolean)
  }

  return { q, page, sort, filters }
}

function writeState(prev: URLSearchParams, next: Partial<SearchState>): URLSearchParams {
  const out = new URLSearchParams(prev)

  if ('q' in next) {
    if (next.q) out.set('q', next.q)
    else out.delete('q')
  }
  if ('sort' in next) {
    if (next.sort) out.set('sort', next.sort)
    else out.delete('sort')
  }
  if ('page' in next) {
    if (next.page && next.page > 1) out.set('page', String(next.page))
    else out.delete('page')
  }
  if ('filters' in next && next.filters) {
    for (const key of Array.from(out.keys())) {
      if (key.startsWith('f.')) out.delete(key)
    }
    for (const [field, values] of Object.entries(next.filters)) {
      for (const v of values) {
        if (v != null && v !== '') out.append(`f.${field}`, v)
      }
    }
  }

  return out
}

export function useSearchState() {
  const [params, setParams] = useSearchParams()

  const state = useMemo(() => readState(params), [params])

  const update = useCallback(
    (next: Partial<SearchState>, opts?: { resetPage?: boolean }) => {
      setParams(
        (prev) => {
          const merged = opts?.resetPage ? { ...next, page: 1 } : next
          return writeState(prev, merged)
        },
        { replace: false },
      )
    },
    [setParams],
  )

  const setQuery = useCallback(
    (q: string) => update({ q }, { resetPage: true }),
    [update],
  )
  const setSort = useCallback(
    (sort: SortValue) => update({ sort }, { resetPage: true }),
    [update],
  )
  const setPage = useCallback((page: number) => update({ page }), [update])
  const setFilters = useCallback(
    (filters: Record<string, string[]>) => update({ filters }, { resetPage: true }),
    [update],
  )
  const toggleFilter = useCallback(
    (field: string, value: string) => {
      const current = state.filters[field] ?? []
      const nextValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      const nextFilters = { ...state.filters, [field]: nextValues }
      if (nextValues.length === 0) delete nextFilters[field]
      setFilters(nextFilters)
    },
    [state.filters, setFilters],
  )
  const removeFilter = useCallback(
    (field: string, value: string) => {
      const current = state.filters[field] ?? []
      const nextValues = current.filter((v) => v !== value)
      const nextFilters = { ...state.filters }
      if (nextValues.length === 0) delete nextFilters[field]
      else nextFilters[field] = nextValues
      setFilters(nextFilters)
    },
    [state.filters, setFilters],
  )
  const clearAllFilters = useCallback(() => setFilters({}), [setFilters])

  return {
    state,
    setQuery,
    setSort,
    setPage,
    setFilters,
    toggleFilter,
    removeFilter,
    clearAllFilters,
  }
}

export { readState, writeState }
