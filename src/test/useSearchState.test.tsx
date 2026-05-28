import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useSearchState } from '@/lib/hooks/useSearchState'

function wrapper(initial = '/') {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initial]}>{children}</MemoryRouter>
  )
}

describe('useSearchState', () => {
  it('reads defaults from empty URL', () => {
    const { result } = renderHook(() => useSearchState(), { wrapper: wrapper('/') })
    expect(result.current.state).toEqual({ q: '', page: 1, sort: '', filters: {} })
  })

  it('parses query, page, sort and filters from URL', () => {
    const { result } = renderHook(() => useSearchState(), {
      wrapper: wrapper('/?q=jeans&page=3&sort=price:asc&f.brand=Acme&f.brand=Globex&f.color=red'),
    })
    expect(result.current.state).toEqual({
      q: 'jeans',
      page: 3,
      sort: 'price:asc',
      filters: { brand: ['Acme', 'Globex'], color: ['red'] },
    })
  })

  it('ignores malformed sort values', () => {
    const { result } = renderHook(() => useSearchState(), {
      wrapper: wrapper('/?sort=bogus'),
    })
    expect(result.current.state.sort).toBe('')
  })

  it('setQuery resets page to 1 and updates URL', () => {
    function ProbeWrapper({ children }: { children: ReactNode }) {
      return <MemoryRouter initialEntries={['/?q=old&page=5']}>{children}</MemoryRouter>
    }
    const { result } = renderHook(
      () => ({ state: useSearchState(), location: useLocation() }),
      { wrapper: ProbeWrapper },
    )
    act(() => result.current.state.setQuery('shoes'))
    expect(result.current.state.state.q).toBe('shoes')
    expect(result.current.state.state.page).toBe(1)
    expect(result.current.location.search).toContain('q=shoes')
    expect(result.current.location.search).not.toContain('page=')
  })

  it('toggleFilter adds and removes values', () => {
    const { result } = renderHook(() => useSearchState(), { wrapper: wrapper('/') })
    act(() => result.current.toggleFilter('brand', 'Acme'))
    expect(result.current.state.filters).toEqual({ brand: ['Acme'] })
    act(() => result.current.toggleFilter('brand', 'Acme'))
    expect(result.current.state.filters).toEqual({})
  })

  it('clearAllFilters wipes only filter params', () => {
    const { result } = renderHook(
      () => ({ s: useSearchState(), loc: useLocation() }),
      { wrapper: wrapper('/?q=jeans&f.brand=Acme&f.color=red') },
    )
    act(() => result.current.s.clearAllFilters())
    expect(result.current.s.state.filters).toEqual({})
    expect(result.current.loc.search).toContain('q=jeans')
    expect(result.current.loc.search).not.toContain('f.brand')
  })
})
