import { useState } from "react"
import { FolderPlus, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjectStore } from "@/store/projectStore"
import { ProjectNameDialog } from "./project-name-dialog"

type PreviewField = {
  name: string
  type: string
  isPrimaryKey?: boolean
}

type PreviewTable = {
  name: string
  fields: PreviewField[]
  // Position/size as a percentage of the 560x260 preview area, so the
  // table divs and the SVG connector lines stay aligned at any screen size
  left: string
  top: string
  width: string
}

const PREVIEW_TABLES: PreviewTable[] = [
  {
    name: "User",
    left: "2%",
    top: "6%",
    width: "30%",
    fields: [
      { name: "id", type: "UUID", isPrimaryKey: true },
      { name: "email", type: "VARCHAR" },
    ],
  },
  {
    name: "Post",
    left: "68%",
    top: "6%",
    width: "30%",
    fields: [
      { name: "id", type: "UUID", isPrimaryKey: true },
      { name: "title", type: "VARCHAR" },
      { name: "user_id", type: "UUID" },
    ],
  },
  {
    name: "Comment",
    left: "35%",
    top: "62%",
    width: "30%",
    fields: [
      { name: "id", type: "UUID", isPrimaryKey: true },
      { name: "text", type: "TEXT" },
      { name: "post_id", type: "UUID" },
    ],
  },
]

function PreviewTableCard({ table }: { table: PreviewTable }) {
  return (
    <div
      className="absolute overflow-hidden rounded-lg border border-border bg-card shadow-sm"
      style={{ left: table.left, top: table.top, width: table.width }}
    >
      <div className="border-b border-border bg-muted/70 px-2.5 py-1.5 text-[11px] font-semibold">
        {table.name}
      </div>
      <div className="divide-y divide-border">
        {table.fields.map((field) => (
          <div
            key={field.name}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[10px]"
          >
            {field.isPrimaryKey && (
              <Key size={10} className="shrink-0 text-amber-600" />
            )}
            <span className="flex-1 truncate">{field.name}</span>
            <span className="text-muted-foreground">{field.type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SchemaPreview() {
  return (
    <div className="relative mx-auto mb-8 aspect-560/260 w-full max-w-xl">
      {/* Connector lines — drawn in a fixed 560x260 coordinate space that
          lines up with the % positions of the table cards above */}
      <svg
        viewBox="0 0 560 260"
        className="absolute inset-0 h-full w-full text-muted-foreground/50"
        fill="none"
      >
        <defs>
          <marker
            id="preview-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M2 1L8 5L2 9"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
          </marker>
        </defs>

        {/* Post.user_id -> User.id */}
        <path
          d="M 390 45 C 300 45, 260 45, 172 45"
          stroke="currentColor"
          strokeWidth="1.5"
          markerEnd="url(#preview-arrow)"
        />

        {/* Comment.post_id -> Post.id */}
        <path
          d="M 300 170 C 360 140, 400 100, 430 78"
          stroke="currentColor"
          strokeWidth="1.5"
          markerEnd="url(#preview-arrow)"
        />
      </svg>

      {PREVIEW_TABLES.map((table) => (
        <PreviewTableCard key={table.name} table={table} />
      ))}
    </div>
  )
}

export function EmptyProjectState() {
  const createProject = useProjectStore((s) => s.createProject)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="flex h-full min-h-125 w-full flex-col items-center justify-center overflow-hidden bg-dot-pattern p-8 text-center">
      <SchemaPreview />

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-6 max-w-sm space-y-1.5">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            No project opened
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Create a new project or open one from the sidebar to start designing
            — drag tables onto the canvas and connect fields to build a schema
            like the one above.
          </p>
        </div>

        <Button onClick={() => setDialogOpen(true)} className="gap-2 shadow-sm">
          <FolderPlus size={14} />
          New project
        </Button>
      </div>

      <ProjectNameDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode="create"
        onSubmit={(name) => createProject(name)}
      />
    </div>
  )
}
