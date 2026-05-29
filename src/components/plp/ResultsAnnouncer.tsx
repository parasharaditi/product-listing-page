import { useState } from 'react'
import { formatCount } from '@/lib/utils/format'

export interface ResultsAnnouncerProps {
  query: string
  totalResults: number
  loading: boolean
}

export function ResultsAnnouncer({ query, totalResults, loading }: ResultsAnnouncerProps) {
  const [message, setMessage] = useState('')
  const [lastSig, setLastSig] = useState('')

  if (!loading) {
    const sig = `${query}|${totalResults}`
    if (sig !== lastSig) {
      const target = query ? `for "${query}"` : ''
      const next = `${formatCount(totalResults)} ${totalResults === 1 ? 'result' : 'results'} ${target}`.trim()
      setLastSig(sig)
      setMessage(next)
    }
  }

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  )
}
