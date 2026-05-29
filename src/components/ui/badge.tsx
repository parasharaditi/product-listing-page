import type { HTMLAttributes } from 'react'

const variantStyles = {
  default: 'bg-black/10 text-[var(--color-fg)]',
  sale: 'bg-[var(--color-sale)] text-white',
  outline: 'border border-[var(--color-border)]',
}

export function Badge({
  className,
  variant = 'default',
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variantStyles }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className ?? ''}`}
      {...rest}
    />
  )
}
