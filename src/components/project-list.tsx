import { useEffect, useState } from "react"
import { Folder } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useProjectStore } from "@/store/projectStore"
import { ProjectNameDialog } from "./project-name-dialog"
import type { ProjectSummary } from "@/types/project.types"

export function ProjectList() {
  const projects = useProjectStore((s) => s.projects)
  const currentProjectId = useProjectStore((s) => s.currentProjectId)
  const refreshProjectList = useProjectStore((s) => s.refreshProjectList)
  const openProject = useProjectStore((s) => s.openProject)
  const renameProject = useProjectStore((s) => s.renameProject)

  const [renameTarget, setRenameTarget] = useState<ProjectSummary | null>(null)

  useEffect(() => {
    refreshProjectList()
  }, [refreshProjectList])

  if (projects.length === 0) {
    return (
      <div className="px-2 py-4 text-sm text-muted-foreground">
        No projects yet
      </div>
    )
  }

  return (
    <>
      <SidebarMenu>
        {projects.map((project) => (
          <SidebarMenuItem key={project.id}>
            <SidebarMenuButton
              isActive={project.id === currentProjectId}
              onClick={() => openProject(project.id)}
              tooltip={project.name}
              className={`${project.id === currentProjectId ? "bg-foreground font-medium text-background" : ""}`}
            >
              <Folder className="h-4 w-4 shrink-0" />
              <span className="truncate">{project.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <ProjectNameDialog
        open={renameTarget !== null}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        mode="rename"
        initialName={renameTarget?.name}
        onSubmit={(name) => {
          if (renameTarget) renameProject(renameTarget.id, name)
        }}
      />
    </>
  )
}
