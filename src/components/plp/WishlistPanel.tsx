import * as Dialog from '@radix-ui/react-dialog'
import { Heart, ImageOff, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/format'
import type { Product } from '@/lib/api/types'

export interface WishlistPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: Product[]
  onRemove: (uid: string) => void
  onClear: () => void
}

export default function WishlistPanel({
  open,
  onOpenChange,
  items,
  onRemove,
  onClear,
}: WishlistPanelProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[var(--color-bg)] shadow-xl focus:outline-none"
        >
          <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
            <Dialog.Title className="flex items-center gap-2 text-base font-semibold">
              <Heart aria-hidden="true" className="h-4 w-4" />
              Wishlist
              <span className="text-sm font-normal text-[var(--color-muted)]">
                ({items.length})
              </span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close wishlist"
                className="rounded p-1 hover:bg-black/5"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center text-[var(--color-muted)]">
                <Heart aria-hidden="true" className="h-10 w-10" />
                <p className="mt-3 text-sm">
                  Your wishlist is empty. Tap the heart on any product to save it here.
                </p>
              </div>
            ) : (
              <ul role="list" className="divide-y divide-[var(--color-border)]">
                {items.map((p) => {
                  const img = p.thumbnailImageUrl ?? p.imageUrl
                  const onSale = !!p.msrp && p.msrp > p.price
                  return (
                    <li key={p.uid} className="flex gap-3 p-3">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-black/5">
                        {img ? (
                          <img
                            src={img}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[var(--color-muted)]">
                            <ImageOff aria-hidden="true" className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        {p.brand && (
                          <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                            {p.brand}
                          </span>
                        )}
                        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
                          {p.name}
                        </h3>
                        <div className="mt-auto flex items-baseline gap-2 pt-1">
                          <span className={`text-sm font-semibold ${onSale ? 'text-[var(--color-sale)]' : ''}`}>
                            {formatPrice(p.price)}
                          </span>
                          {onSale && (
                            <span className="text-xs text-[var(--color-muted)] line-through">
                              {formatPrice(p.msrp)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(p.uid)}
                        aria-label={`Remove ${p.name} from wishlist`}
                        className="self-start rounded p-1 text-[var(--color-muted)] hover:bg-black/5"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-[var(--color-border)] p-4">
              <Button variant="outline" className="w-full" onClick={onClear}>
                Clear wishlist
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
