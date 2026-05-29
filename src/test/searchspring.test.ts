import { describe, it, expect } from 'vitest'
import { buildSearchUrl } from '@/lib/api/searchspring'

describe('buildSearchUrl', () => {
  it('always sends siteId and resultsFormat', () => {
    const url = new URL(buildSearchUrl({}))
    expect(url.searchParams.get('siteId')).toBe('scmq7n')
    expect(url.searchParams.get('resultsFormat')).toBe('native')
  })

  it('omits page when it is 1 (default)', () => {
    const url = new URL(buildSearchUrl({ page: 1 }))
    expect(url.searchParams.has('page')).toBe(false)
  })

  it('serializes page > 1, query, and resultsPerPage', () => {
    const url = new URL(buildSearchUrl({ q: 'jeans', page: 3, resultsPerPage: 24 }))
    expect(url.searchParams.get('q')).toBe('jeans')
    expect(url.searchParams.get('page')).toBe('3')
    expect(url.searchParams.get('resultsPerPage')).toBe('24')
  })

  it('encodes sort as sort.<field>=<direction>', () => {
    const url = new URL(buildSearchUrl({ sort: 'price:desc' }))
    expect(url.searchParams.get('sort.price')).toBe('desc')
  })

  it('ignores malformed sort values', () => {
    const url = new URL(buildSearchUrl({ sort: 'no-colon' }))
    expect([...url.searchParams.keys()].some((k) => k.startsWith('sort.'))).toBe(false)
  })

  it('serializes multi-value list filters as repeated filter.<field> params', () => {
    const url = new URL(buildSearchUrl({ filters: { brand: ['Acme', 'Globex'] } }))
    expect(url.searchParams.getAll('filter.brand')).toEqual(['Acme', 'Globex'])
  })

  it('unpacks "low:high" range values into filter.<field>.low/.high', () => {
    const url = new URL(buildSearchUrl({ filters: { price: ['20:310'] } }))
    expect(url.searchParams.get('filter.price.low')).toBe('20')
    expect(url.searchParams.get('filter.price.high')).toBe('310')
    expect(url.searchParams.has('filter.price')).toBe(false)
  })

  it('supports open-ended ranges ("20:" and ":310")', () => {
    const a = new URL(buildSearchUrl({ filters: { price: ['20:'] } }))
    expect(a.searchParams.get('filter.price.low')).toBe('20')
    expect(a.searchParams.has('filter.price.high')).toBe(false)

    const b = new URL(buildSearchUrl({ filters: { price: [':310'] } }))
    expect(b.searchParams.has('filter.price.low')).toBe(false)
    expect(b.searchParams.get('filter.price.high')).toBe('310')
  })
})
