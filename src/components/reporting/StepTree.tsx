import type { StepNode as StepNodeType } from '@/types/testReport'
import { StepNode } from './StepNode'

export function StepTree({ steps }: { steps: StepNodeType[] | null | undefined }) {
  const list = Array.isArray(steps) ? steps : []
  if (list.length === 0) {
    return (
      <p className="text-sm text-[var(--color-report-muted)]">No steps recorded.</p>
    )
  }
  return (
    <div className="space-y-1">
      {list.map((node, i) => (
        <StepNode key={i} node={node} depth={0} />
      ))}
    </div>
  )
}
