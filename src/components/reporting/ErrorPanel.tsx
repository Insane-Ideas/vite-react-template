import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type ErrorPanelProps = {
  message?: string | null
  stack?: string | null
  className?: string
}

export function ErrorPanel({ message, stack, className }: ErrorPanelProps) {
  const [open, setOpen] = useState(false)
  const hasStack = Boolean(stack?.trim())
  const snippet =
    message?.trim() ||
    (typeof stack === 'string' ? stack.split('\n')[0]?.trim() : '') ||
    'Error'

  if (!message?.trim() && !hasStack) return null

  return (
    <div
      className={cn(
        'rounded-lg border border-rose-500/25 bg-rose-950/30 text-sm text-rose-100',
        className
      )}
    >
      <p className="px-3 py-2 font-medium leading-snug">{snippet}</p>
      {hasStack && (
        <>
          <button
            type="button"
            className="flex w-full items-center gap-1 border-t border-rose-500/20 px-3 py-1.5 text-left text-xs text-rose-200/90 hover:bg-rose-950/40"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? (
              <ChevronDown className="size-3.5 shrink-0" />
            ) : (
              <ChevronRight className="size-3.5 shrink-0" />
            )}
            {open ? 'Hide' : 'Show'} full stack
          </button>
          {open && (
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all border-t border-rose-500/20 px-3 py-2 text-xs text-rose-100/90">
              {stack}
            </pre>
          )}
        </>
      )}
    </div>
  )
}
