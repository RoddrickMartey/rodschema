import { useRef, useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import {
  Plus,
  Download,
  Upload,
  ChevronDown,
  Folder,
  Check,
  Pencil,
  Trash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { useCanvasStore } from "@/store/canvasStore"
import { useProjectStore } from "@/store/projectStore"
import { useCompiledSchema } from "@/hooks/useCompiledSchema"
import { toCanvasState, fromCanvasState } from "@/lib/canvas/canvasConverters"
import {
  exportProjectAsJSON,
  exportGeneratedCode,
  importProjectFromJSON,
  type GeneratedTarget,
} from "@/lib/export/exportImport"
import { ProjectNameDialog } from "./project-name-dialog"
import type { CanvasState } from "@/types/schema.types"
import type { ProjectSummary } from "@/types/project.types"

export function Toolbar() {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const addTable = useCanvasStore((s) => s.addTable)
  const loadCanvas = useCanvasStore((s) => s.loadCanvas)

  // Project store state & handlers (matching ProjectList)
  const projects = useProjectStore((s) => s.projects)
  const currentProjectId = useProjectStore((s) => s.currentProjectId)
  const refreshProjectList = useProjectStore((s) => s.refreshProjectList)
  const openProject = useProjectStore((s) => s.openProject)
  const createProject = useProjectStore((s) => s.createProject)
  const renameProject = useProjectStore((s) => s.renameProject)
  const deleteProject = useProjectStore((s) => s.deleteProject)

  const { output, hasErrors } = useCompiledSchema()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<CanvasState | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  // Dialog targets
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<ProjectSummary | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProjectSummary | null>(null)

  useEffect(() => {
    refreshProjectList()
  }, [refreshProjectList])

  const currentProject = projects.find((p) => p.id === currentProjectId)

  function handleNewTable() {
    const index = nodes.length
    const position = {
      x: 100 + (index % 5) * 260,
      y: 100 + Math.floor(index / 5) * 220,
    }

    addTable({
      id: uuidv4(),
      name: "new_table",
      position,
      fields: [
        {
          id: uuidv4(),
          name: "id",
          type: "UUID",
          isPrimaryKey: true,
          isUnique: true,
          isNullable: false,
        },
      ],
    })
  }

  function handleExportJSON() {
    exportProjectAsJSON(
      toCanvasState(nodes, edges),
      currentProject?.name ?? "untitled"
    )
  }

  function handleExportCode(target: GeneratedTarget) {
    if (!output) return
    exportGeneratedCode(output, target, currentProject?.name ?? "untitled")
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    const result = await importProjectFromJSON(file)
    if (!result.success) {
      setImportError(result.error)
      return
    }

    setPendingImport(result.canvasState)
  }

  function confirmImport() {
    if (!pendingImport) return
    const { nodes: importedNodes, edges: importedEdges } =
      fromCanvasState(pendingImport)
    loadCanvas(importedNodes, importedEdges)
    setPendingImport(null)
  }

  return (
    <div className="flex items-center gap-2 border-b bg-background px-3 py-2">
      {/* Project Selector Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size="sm" variant="ghost" className="gap-2 font-semibold" />
          }
        >
          <Folder size={14} />
          <span className="max-w-35 truncate">
            {currentProject?.name ?? "Select Project"}
          </span>
          <ChevronDown size={12} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {projects.map((project) => {
            const isActive = project.id === currentProjectId
            return (
              <DropdownMenuItem
                key={project.id}
                onClick={() => openProject(project.id)}
                className="group flex cursor-pointer items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  {isActive ? (
                    <Check size={14} className="text-primary" />
                  ) : (
                    <div className="w-3.5" />
                  )}
                  <span className={isActive ? "font-medium" : ""}>
                    {project.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setRenameTarget(project)
                    }}
                    className="rounded p-1 hover:text-primary"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteTarget(project)
                    }}
                    className="rounded p-1 hover:text-destructive"
                  >
                    <Trash className="h-3 w-3" />
                  </button>
                </div>
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setNewProjectDialogOpen(true)}
            className="flex cursor-pointer items-center gap-2"
          >
            <Plus size={14} />
            <span>New Project</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="my-auto h-4 w-px bg-border" />

      <Button size="sm" onClick={handleNewTable}>
        <Plus size={14} />
        New table
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
          <Download size={14} />
          Export
          <ChevronDown size={12} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={handleExportJSON}>
            Project (.json)
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleExportCode("sql")}
            disabled={hasErrors || !output}
          >
            SQL
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExportCode("prisma")}
            disabled={hasErrors || !output}
          >
            Prisma schema
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExportCode("sqlalchemy")}
            disabled={hasErrors || !output}
          >
            SQLAlchemy models
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        size="sm"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={14} />
        Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* New Project Dialog */}
      <ProjectNameDialog
        open={newProjectDialogOpen}
        onOpenChange={setNewProjectDialogOpen}
        mode="create"
        onSubmit={(name) => createProject(name)}
      />

      {/* Rename Project Dialog */}
      <ProjectNameDialog
        open={renameTarget !== null}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        mode="rename"
        initialName={renameTarget?.name}
        onSubmit={(name) => {
          if (renameTarget) renameProject(renameTarget.id, name)
        }}
      />

      {/* Delete Confirmation Alert */}
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

      {/* Overwrite confirmation */}
      <AlertDialog
        open={pendingImport !== null}
        onOpenChange={(open) => !open && setPendingImport(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace current canvas?</AlertDialogTitle>
            <AlertDialogDescription>
              Importing will replace everything currently on the canvas. Any
              unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>
              Replace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import error */}
      <AlertDialog
        open={importError !== null}
        onOpenChange={(open) => !open && setImportError(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import failed</AlertDialogTitle>
            <AlertDialogDescription>{importError}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setImportError(null)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
