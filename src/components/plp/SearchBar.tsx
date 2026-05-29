import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'

export interface SearchBarProps {
  initialValue: string
  onSubmit: (q: string) => void
  /** Optional debounced live-search callback. */
  onLiveChange?: (q: string) => void
  debounceMs?: number
}

export function SearchBar({
  initialValue,
  onSubmit,
  onLiveChange,
  debounceMs = 300,
}: SearchBarProps) {
  const id = useId()
  const [value, setValue] = useState(initialValue)
  const debounced = useDebouncedValue(value, debounceMs)
  const lastSentRef = useRef(initialValue)
  const submittedRef = useRef(false)

  // Sync from external URL changes (e.g. browser back).
  useEffect(() => {
    setValue(initialValue)
    lastSentRef.current = initialValue
  }, [initialValue])

  useEffect(() => {
    if (!onLiveChange) return
    if (submittedRef.current) {
      submittedRef.current = false
      return
    }
    if (debounced !== lastSentRef.current) {
      lastSentRef.current = debounced
      onLiveChange(debounced)
    }
  }, [debounced, onLiveChange])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submittedRef.current = true
    lastSentRef.current = value
    onSubmit(value.trim())
  }

  function clear() {
    setValue('')
    submittedRef.current = true
    lastSentRef.current = ''
    onSubmit('')
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2"
    >
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <div className="relative flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]"
        />
        <Input
          id={id}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search products…"
          autoComplete="off"
          className="pl-9 pr-9"
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--color-muted)] hover:bg-black/5"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit">Search</Button>
    </form>
  )
}
