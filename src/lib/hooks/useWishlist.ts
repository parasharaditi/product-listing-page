import { useCallback, useEffect, useState } from 'react'
import type { Product } from '@/lib/api/types'

const KEY = 'plp.wishlist'

/**
 * We store full Product objects (not just uids) so the wishlist panel can render
 * cards even after the user navigates away from the search that surfaced them.
 */
type WishlistMap = Record<string, Product>

function read(): WishlistMap {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as WishlistMap) : {}
  } catch {
    return {}
  }
}

function write(map: WishlistMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    /* quota exceeded — fail silently; wishlist is non-critical */
  }
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistMap>(read)

  // Keep tabs in sync — if the user adds an item in another tab, this tab updates too.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setItems(read())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    write(items)
  }, [items])

  const isInWishlist = useCallback((uid: string) => uid in items, [items])

  const toggle = useCallback((product: Product) => {
    setItems((prev) => {
      const next = { ...prev }
      if (product.uid in next) delete next[product.uid]
      else next[product.uid] = product
      return next
    })
  }, [])

  const remove = useCallback((uid: string) => {
    setItems((prev) => {
      if (!(uid in prev)) return prev
      const next = { ...prev }
      delete next[uid]
      return next
    })
  }, [])

  const clear = useCallback(() => setItems({}), [])

  return {
    items: Object.values(items),
    count: Object.keys(items).length,
    isInWishlist,
    toggle,
    remove,
    clear,
  }
}
