import { useEffect, useState } from 'react'
import { formatCount } from '@/lib/utils/format'

export interface ResultsAnnouncerProps {
  query: string
  totalResults: number
  loading: boolean
}

/** Announces result counts after a query settles, for screen readers. */
export function ResultsAnnouncer({ query, totalResults, loading }: ResultsAnnouncerProps) {
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (loading) return
    const target = query ? `for "${query}"` : ''
    setMessage(`${formatCount(totalResults)} ${totalResults === 1 ? 'result' : 'results'} ${target}`.trim())
  }, [query, totalResults, loading])

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  )
}
