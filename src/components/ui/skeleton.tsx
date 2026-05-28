import type { HTMLAttributes } from 'react'

export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-black/5 dark:bg-white/10 ${className ?? ''}`}
      aria-hidden="true"
      {...rest}
    />
  )
}
