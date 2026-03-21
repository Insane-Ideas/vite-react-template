import { useMemo } from 'react'

type JsonAttachmentPreviewProps = {
  data: unknown
  className?: string
}

export function JsonAttachmentPreview({
  data,
  className = '',
}: JsonAttachmentPreviewProps) {
  const text = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }, [data])

  return (
    <pre
      className={`max-h-64 overflow-auto rounded-md border border-white/10 bg-black/40 p-3 text-xs leading-relaxed text-slate-200 ${className}`}
    >
      {text}
    </pre>
  )
}
