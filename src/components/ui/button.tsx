import { forwardRef, type ButtonHTMLAttributes } from 'react'

type Variant = 'default' | 'outline' | 'ghost' | 'destructive'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const variantStyles: Record<Variant, string> = {
  default:
    'bg-[var(--color-accent)] text-[var(--color-accent-fg)] hover:opacity-90',
  outline:
    'border border-[var(--color-border)] bg-transparent hover:bg-black/5',
  ghost: 'bg-transparent hover:bg-black/5',
  destructive: 'bg-[var(--color-sale)] text-white hover:opacity-90',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
  icon: 'h-9 w-9',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', type = 'button', ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className ?? ''}`}
      {...rest}
    />
  ),
)
Button.displayName = 'Button'
