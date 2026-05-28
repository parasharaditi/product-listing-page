import { forwardRef, type InputHTMLAttributes } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm placeholder:text-[var(--color-muted)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ''}`}
      {...rest}
    />
  ),
)
Input.displayName = 'Input'
