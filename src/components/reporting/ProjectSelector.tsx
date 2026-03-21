import type { ProjectSummary } from '@/types/testReport'

type ProjectSelectorProps = {
  projects: ProjectSummary[]
  selectedProjectId: string
  onSelect: (projectId: string) => void
}

export function ProjectSelector({
  projects,
  selectedProjectId,
  onSelect,
}: ProjectSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="project-select" className="text-xs text-[var(--color-report-muted)]">
        Project
      </label>
      <select
        id="project-select"
        value={selectedProjectId}
        onChange={(e) => onSelect(e.target.value)}
        className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-slate-100 outline-none"
      >
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  )
}
