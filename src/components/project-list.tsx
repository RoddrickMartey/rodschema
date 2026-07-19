import { useEffect, useState } from "react"
import { Ellipsis, Pencil, Trash } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useProjectStore } from "@/store/projectStore"
import { ProjectNameDialog } from "./project-name-dialog"
import type { ProjectSummary } from "@/types/project.types"

export function ProjectList() {
  const projects = useProjectStore((s) => s.projects)
  const currentProjectId = useProjectStore((s) => s.currentProjectId)
  const refreshProjectList = useProjectStore((s) => s.refreshProjectList)
  const openProject = useProjectStore((s) => s.openProject)
  const renameProject = useProjectStore((s) => s.renameProject)
  const deleteProject = useProjectStore((s) => s.deleteProject)

  const [renameTarget, setRenameTarget] = useState<ProjectSummary | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProjectSummary | null>(null)

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
            >
              <span className="truncate">{project.name}</span>
            </SidebarMenuButton>

            <DropdownMenu>
              {/* Added asChild here so Radix doesn't wrap the action button in a standard <button> tag breaking vertical spacing */}
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <Ellipsis className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start">
                <DropdownMenuItem
                  onClick={() => setRenameTarget(project)}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteTarget(project)}
                  className="flex cursor-pointer items-center gap-2 text-destructive"
                >
                  <Trash className="h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="border-2 border-destructive/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. The project and everything in it will be
              permanently deleted from this browser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteProject(deleteTarget.id)
                  setDeleteTarget(null)
                }
              }}
              variant="destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
