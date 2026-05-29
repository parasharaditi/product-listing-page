import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useWishlist } from '@/lib/hooks/useWishlist'
import type { Product } from '@/lib/api/types'

const productA: Product = {
  uid: 'a',
  name: 'Linen Tee',
  url: '/p/a',
  imageUrl: 'https://shop.example/a.jpg',
  price: 30,
  brand: 'Acme',
}
const productB: Product = {
  uid: 'b',
  name: 'Suede Boot',
  url: '/p/b',
  imageUrl: 'https://shop.example/b.jpg',
  price: 120,
  brand: 'Globex',
}

describe('useWishlist', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts empty when there is nothing in storage', () => {
    const { result } = renderHook(() => useWishlist())
    expect(result.current.items).toEqual([])
    expect(result.current.count).toBe(0)
    expect(result.current.isInWishlist('a')).toBe(false)
  })

  it('toggle adds and removes a product, keeping count consistent', () => {
    const { result } = renderHook(() => useWishlist())

    act(() => result.current.toggle(productA))
    expect(result.current.count).toBe(1)
    expect(result.current.isInWishlist('a')).toBe(true)
    expect(result.current.items[0]?.uid).toBe('a')

    act(() => result.current.toggle(productA))
    expect(result.current.count).toBe(0)
    expect(result.current.isInWishlist('a')).toBe(false)
  })

  it('persists across hook instances via localStorage', () => {
    const first = renderHook(() => useWishlist())
    act(() => first.result.current.toggle(productA))
    act(() => first.result.current.toggle(productB))

    const second = renderHook(() => useWishlist())
    expect(second.result.current.count).toBe(2)
    expect(second.result.current.isInWishlist('a')).toBe(true)
    expect(second.result.current.isInWishlist('b')).toBe(true)
  })

  it('remove deletes a single item without touching others', () => {
    const { result } = renderHook(() => useWishlist())
    act(() => result.current.toggle(productA))
    act(() => result.current.toggle(productB))
    act(() => result.current.remove('a'))

    expect(result.current.count).toBe(1)
    expect(result.current.isInWishlist('a')).toBe(false)
    expect(result.current.isInWishlist('b')).toBe(true)
  })

  it('clear empties the wishlist', () => {
    const { result } = renderHook(() => useWishlist())
    act(() => result.current.toggle(productA))
    act(() => result.current.toggle(productB))
    act(() => result.current.clear())
    expect(result.current.count).toBe(0)
  })

  it('tolerates corrupt localStorage data (does not throw)', () => {
    localStorage.setItem('plp.wishlist', '{not valid json')
    const { result } = renderHook(() => useWishlist())
    expect(result.current.items).toEqual([])
  })
})
