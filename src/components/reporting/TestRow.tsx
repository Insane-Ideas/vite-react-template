import { ChevronDown, ChevronRight } from 'lucide-react'
import type { TestResultRow } from '@/types/testReport'
import { cn } from '@/lib/utils'
import { Duration } from './Duration'
import { ErrorPanel } from './ErrorPanel'
import { StatusBadge } from './StatusBadge'
import { AttachmentItem } from './AttachmentItem'
import { StepTree } from './StepTree'

type TestRowProps = {
  result: TestResultRow
  expanded: boolean
  onToggle: () => void
}

export function TestRow({ result, expanded, onToggle }: TestRowProps) {
  const failed = result.status?.toLowerCase() === 'failed'

  return (
    <div
      className={cn(
        'rounded-lg border border-white/10 bg-[var(--color-report-surface)]',
        failed && 'border-rose-500/35 bg-rose-950/20'
      )}
    >
      <button
        type="button"
        className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
        onClick={onToggle}
      >
        {expanded ? (
          <ChevronDown className="mt-0.5 size-4 shrink-0 text-[var(--color-report-muted)]" />
        ) : (
          <ChevronRight className="mt-0.5 size-4 shrink-0 text-[var(--color-report-muted)]" />
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={result.status} />
            <Duration ms={result.duration_ms} />
            {result.retry != null && result.retry > 0 && (
              <span className="text-xs text-[var(--color-report-muted)]">
                retry {result.retry}
              </span>
            )}
          </div>
          <p className="font-mono text-xs text-[var(--color-report-muted)]">
            {result.file ?? '—'}
          </p>
          <p className="text-sm font-medium text-slate-100">
            {result.title ?? result.full_title ?? 'Untitled test'}
          </p>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-white/10 px-3 pb-3 pt-2">
          {(result.error_message || result.error_stack) && (
            <div className="mb-3">
              <ErrorPanel
                message={result.error_message}
                stack={result.error_stack}
              />
            </div>
          )}
          <StepTree steps={result.steps} />
          {Array.isArray(result.attachments) && result.attachments.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-3">
              <p className="mb-2 text-xs font-medium text-slate-300">
                Test attachments
              </p>
              {result.attachments.map((a, i) => (
                <AttachmentItem key={i} a={a} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
