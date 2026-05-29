import { useState } from 'react'
import { Heart, ImageOff, ShoppingBag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { discountPercent, formatPrice } from '@/lib/utils/format'
import type { Product } from '@/lib/api/types'

export interface ProductCardProps {
  product: Product
  className?: string
  isWishlisted?: boolean
  onToggleWishlist?: (product: Product) => void
}

export function ProductCard({
  product,
  className,
  isWishlisted,
  onToggleWishlist,
}: ProductCardProps) {
  const [thumbFailed, setThumbFailed] = useState(false)
  const [fullLoaded, setFullLoaded] = useState(false)
  const [fullFailed, setFullFailed] = useState(false)
  const price = product.price ?? 0
  const msrp = product.msrp
  const showStrikethrough = !!msrp && msrp > price
  const discount = discountPercent(price, msrp)

  const thumb = product.thumbnailImageUrl && !thumbFailed ? product.thumbnailImageUrl : undefined
  const full = product.imageUrl && !fullFailed ? product.imageUrl : undefined
  const waitingForFull = !!full && !fullLoaded
  const noImages = !thumb && !full

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] ${className ?? ''}`}
    >
      <div className="relative aspect-square overflow-hidden bg-black/5">
        {noImages ? (
          <div className="flex h-full w-full items-center justify-center text-[var(--color-muted)]">
            <ImageOff aria-hidden="true" className="h-10 w-10" />
          </div>
        ) : (
          <>
            {thumb && (
              <img
                src={thumb}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                onError={() => setThumbFailed(true)}
                className={`absolute inset-0 h-full w-full object-cover transition-[filter,transform] duration-500 ${
                  waitingForFull ? 'scale-105 blur-lg' : ''
                }`}
              />
            )}
            {full && (
              <img
                src={full}
                alt={thumb ? '' : product.name}
                aria-hidden={thumb ? 'true' : undefined}
                loading="lazy"
                decoding="async"
                width={400}
                height={400}
                onLoad={() => setFullLoaded(true)}
                onError={() => setFullFailed(true)}
                className={`relative h-full w-full object-cover transition-opacity duration-500 ${
                  fullLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}
          </>
        )}
        {discount != null && (
          <Badge variant="sale" className="absolute left-2 top-2" aria-hidden="true">
            -{discount}%
          </Badge>
        )}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={() => onToggleWishlist(product)}
            aria-pressed={isWishlisted}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--color-fg)] shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
          >
            <Heart
              aria-hidden="true"
              className={`h-4 w-4 transition-colors ${
                isWishlisted ? 'fill-[var(--color-sale)] text-[var(--color-sale)]' : ''
              }`}
            />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.brand && (
          <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {product.brand}
          </div>
        )}
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className={`font-semibold ${showStrikethrough ? 'text-[var(--color-sale)]' : ''}`}>
            {formatPrice(price)}
          </span>
          {showStrikethrough && (
            <span className="text-xs text-[var(--color-muted)] line-through">
              {formatPrice(msrp)}
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label={`Add ${product.name} to cart`}
          className="group/cart mt-3 inline-flex h-9 w-full items-center justify-center gap-2 overflow-hidden rounded-md bg-[var(--color-fg)] px-3 text-sm font-medium text-[var(--color-bg)] transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <ShoppingBag
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-300 group-hover/cart:-translate-x-0.5"
          />
          <span className="transition-transform duration-300 group-hover/cart:translate-x-0.5">
            Add to cart
          </span>
        </button>
      </div>
    </article>
  )
}
