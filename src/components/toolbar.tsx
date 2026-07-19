import { useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Plus, Download, Upload, ChevronDown } from "lucide-react"
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
import type { CanvasState } from "@/types/schema.types"

export function Toolbar() {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const addTable = useCanvasStore((s) => s.addTable)
  const loadCanvas = useCanvasStore((s) => s.loadCanvas)
  const currentProjectName = useProjectStore((s) => s.currentProjectName)
  const { output, hasErrors } = useCompiledSchema()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<CanvasState | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

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
      currentProjectName ?? "untitled"
    )
  }

  function handleExportCode(target: GeneratedTarget) {
    if (!output) return
    exportGeneratedCode(output, target, currentProjectName ?? "untitled")
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // reset so selecting the same file twice still fires onChange
    if (!file) return

    const result = await importProjectFromJSON(file)
    if (!result.success) {
      setImportError(result.error)
      return
    }

    // Importing replaces the current canvas — confirm before overwriting
    // anything the user hasn't saved yet
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
      <Button size="sm" onClick={handleNewTable}>
        <Plus size={14} />
        New table
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button size="sm" variant="outline">
            <Download size={14} />
            Export
            <ChevronDown size={12} />
          </Button>
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
