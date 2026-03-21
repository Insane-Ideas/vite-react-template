import {
  Anchor,
  Box,
  Cable,
  CircleDot,
  ChevronRight,
  Layers,
  Wrench,
} from 'lucide-react'
import type { StepNode as StepNodeType } from '@/types/testReport'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Duration } from './Duration'
import { ErrorPanel } from './ErrorPanel'
import { AttachmentItem } from './AttachmentItem'

function categoryIcon(category: string | undefined) {
  const c = (category ?? '').toLowerCase()
  if (c.includes('hook')) return Anchor
  if (c.includes('fixture')) return Box
  if (c.includes('pw:api') || c.includes('api')) return Cable
  if (c.includes('test.step') || c.includes('step')) return Layers
  if (c.includes('expect') || c.includes('assert')) return CircleDot
  return Wrench
}

function parseStepError(error: StepNodeType['error']) {
  if (error == null)
    return {
      message: undefined as string | undefined,
      stack: undefined as string | undefined,
    }
  if (typeof error === 'string') return { message: error, stack: undefined }
  return {
    message: error.message,
    stack: error.stack,
  }
}

type StepNodeProps = {
  node: StepNodeType
  depth: number
}

export function StepNode({ node, depth }: StepNodeProps) {
  const title = node.title ?? '(untitled step)'
  const category = typeof node.category === 'string' ? node.category : undefined
  const Icon = categoryIcon(category)
  const duration =
    typeof node.duration === 'number' ? node.duration : undefined
  const { message, stack } = parseStepError(node.error)
  const children = Array.isArray(node.steps) ? node.steps : []
  const attachments = Array.isArray(node.attachments) ? node.attachments : []
  const hasBody = children.length > 0

  const header = (
    <div className="flex min-w-0 items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-[var(--color-report-accent)] opacity-90" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-medium text-slate-100">{title}</span>
          {category && (
            <span className="text-xs text-[var(--color-report-muted)]">
              {category}
            </span>
          )}
          {duration != null && (
            <span className="text-xs text-[var(--color-report-muted)]">
              <Duration ms={duration} />
            </span>
          )}
        </div>
      </div>
    </div>
  )

  const extras = (
    <>
      {(message || stack) && (
        <div className="mt-2">
          <ErrorPanel message={message} stack={stack} />
        </div>
      )}
        {attachments.map((a, i) => (
          <AttachmentItem key={i} a={a} />
        ))}
    </>
  )

  if (!hasBody) {
    return (
      <div
        className={cn(
          'border-l border-white/10 py-2 pl-3',
          depth === 0 && 'border-l-0 pl-0'
        )}
      >
        {header}
        {extras}
      </div>
    )
  }

  return (
    <Collapsible
      defaultOpen={depth < 2}
      className="group border-l border-white/10 pl-2"
    >
      <div className={cn('py-2', depth === 0 && 'border-l-0 pl-0')}>
        <CollapsibleTrigger className="flex w-full items-start gap-2 rounded-md py-0.5 text-left outline-none hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[var(--color-report-accent)]">
          <ChevronRight className="mt-1 size-4 shrink-0 text-[var(--color-report-muted)] transition-transform group-data-[state=open]:rotate-90" />
          <div className="min-w-0 flex-1">{header}</div>
        </CollapsibleTrigger>
        <div className="pl-6">{extras}</div>
        <CollapsibleContent>
          <div className="mt-1 space-y-0 border-l border-white/5 pl-3">
            {children.map((child, idx) => (
              <StepNode key={idx} node={child} depth={depth + 1} />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
