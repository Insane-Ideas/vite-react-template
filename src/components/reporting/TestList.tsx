import { useLayoutEffect, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { TestResultRow } from '@/types/testReport'
import { TestRow } from './TestRow'

const VIRTUAL_THRESHOLD = 200

type TestListProps = {
  results: TestResultRow[]
  expandedId: string | null
  onToggle: (id: string) => void
}

export function TestList({ results, expandedId, onToggle }: TestListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualize = results.length > VIRTUAL_THRESHOLD

  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (expandedId === results[index]?.id ? 220 : 72),
    overscan: 6,
    enabled: virtualize,
  })

  useLayoutEffect(() => {
    if (virtualize) virtualizer.measure()
  }, [expandedId, virtualize, virtualizer, results.length])

  if (results.length === 0) {
    return (
      <p className="text-sm text-[var(--color-report-muted)]">
        No tests in this run.
      </p>
    )
  }

  if (!virtualize) {
    return (
      <div className="space-y-2">
        {results.map((r) => (
          <TestRow
            key={r.id}
            result={r}
            expanded={expandedId === r.id}
            onToggle={() => onToggle(r.id)}
          />
        ))}
      </div>
    )
  }

  const items = virtualizer.getVirtualItems()

  return (
    <div
      ref={parentRef}
      className="h-[min(70vh,720px)] overflow-auto rounded-lg border border-white/10"
    >
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {items.map((vi) => {
          const r = results[vi.index]
          if (!r) return null
          return (
            <div
              key={r.id}
              className="absolute left-0 top-0 w-full px-1 py-1"
              style={{
                transform: `translateY(${vi.start}px)`,
              }}
            >
              <TestRow
                result={r}
                expanded={expandedId === r.id}
                onToggle={() => onToggle(r.id)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
