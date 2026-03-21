import type { StepAttachment } from '@/types/testReport'
import { JsonAttachmentPreview } from './JsonAttachmentPreview'

export function AttachmentItem({ a }: { a: StepAttachment }) {
  const name = a.name ?? 'attachment'
  const path = typeof a.path === 'string' ? a.path : undefined
  const json = a.json
  const contentType = (a.contentType as string | undefined)?.toLowerCase() ?? ''

  if (json !== undefined && json !== null) {
    return (
      <div className="mt-2 space-y-1">
        <p className="text-xs font-medium text-[var(--color-report-muted)]">
          {name}
          {contentType ? ` · ${contentType}` : ''}
        </p>
        <JsonAttachmentPreview data={json} />
      </div>
    )
  }

  if (path) {
    return (
      <div className="mt-2 rounded border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs">
        <span className="font-medium text-slate-200">{name}</span>
        <p className="mt-1 font-mono text-[var(--color-report-muted)]">{path}</p>
        <p className="mt-1 text-[var(--color-report-muted)]">
          Open this path locally (artifact not loaded in the browser).
        </p>
      </div>
    )
  }

  return (
    <div className="mt-2 rounded border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-[var(--color-report-muted)]">
      {name} (no inline preview)
    </div>
  )
}
