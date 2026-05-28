import { useEffect, useState } from 'react'

export type ViewMode = 'pages' | 'infinite'

const KEY = 'plp.viewMode'

function read(): ViewMode {
  if (typeof localStorage === 'undefined') return 'pages'
  const raw = localStorage.getItem(KEY)
  return raw === 'infinite' ? 'infinite' : 'pages'
}

export function useViewMode(): [ViewMode, (m: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>(read)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, mode)
    } catch {
      /* noop */
    }
  }, [mode])

  return [mode, setMode]
}
