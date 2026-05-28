import { useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function RouteErrorBoundary() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error'

  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Something broke</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">{message}</p>
      <Button className="mt-6" onClick={() => window.location.assign('/')}>
        Go home
      </Button>
    </main>
  )
}
