import { ProductCard } from './ProductCard'
import { ProductCardSkeleton } from './ProductCardSkeleton'
import type { Product } from '@/lib/api/types'

export interface ProductGridProps {
  products: Product[]
  loading?: boolean
  loadingCount?: number
}

export function ProductGrid({ products, loading, loadingCount = 12 }: ProductGridProps) {
  return (
    <ul
      role="list"
      aria-busy={loading || undefined}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      {loading
        ? Array.from({ length: loadingCount }).map((_, i) => (
            <li key={i}>
              <ProductCardSkeleton />
            </li>
          ))
        : products.map((p) => (
            <li key={p.uid}>
              <ProductCard product={p} />
            </li>
          ))}
    </ul>
  )
}
