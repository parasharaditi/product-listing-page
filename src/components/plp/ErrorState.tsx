import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ErrorStateProps {
  onRetry: () => void
  message?: string
}

export function ErrorState({ onRetry, message }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-[var(--color-sale)]/30 bg-[var(--color-sale)]/5 py-16 text-center"
    >
      <AlertTriangle aria-hidden="true" className="h-12 w-12 text-[var(--color-sale)]" />
      <h2 className="mt-4 text-lg font-semibold">Something went wrong</h2>
      <p className="mt-1 max-w-md text-sm text-[var(--color-muted)]">
        {message ?? "We couldn't load products right now. Please check your connection and try again."}
      </p>
      <Button className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
