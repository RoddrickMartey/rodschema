import { useEffect, useRef, useState } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Key, Plus, Trash, Asterisk } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { useCanvasStore } from "@/store/canvasStore"
import { FieldFormDialog } from "./field-form-dialog"
import type { TableNode as TableNodeType } from "@/types/reactflow.types"
import type { Field as SchemaField } from "@/types/schema.types"

export function TableNode({ id, data, selected }: NodeProps<TableNodeType>) {
  const deleteTable = useCanvasStore((s) => s.deleteTable)
  const updateTable = useCanvasStore((s) => s.updateTable)
  const deleteField = useCanvasStore((s) => s.deleteField)
  const addField = useCanvasStore((s) => s.addField)
  const updateField = useCanvasStore((s) => s.updateField)

  // --- Inline table-name editing ---
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(data.name)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditingName) nameInputRef.current?.select()
  }, [isEditingName])

  function commitName() {
    const trimmed = nameDraft.trim()
    if (trimmed && trimmed !== data.name) {
      updateTable(id, { name: trimmed })
    } else {
      setNameDraft(data.name) // revert if blank or unchanged
    }
    setIsEditingName(false)
  }

  // --- Field add/edit dialog ---
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false)
  const [fieldDialogMode, setFieldDialogMode] = useState<"add" | "edit">("add")
  const [editingField, setEditingField] = useState<SchemaField | undefined>(
    undefined
  )

  function openAddFieldDialog() {
    setFieldDialogMode("add")
    setEditingField(undefined)
    setFieldDialogOpen(true)
  }

  function openEditFieldDialog(field: SchemaField) {
    setFieldDialogMode("edit")
    setEditingField(field)
    setFieldDialogOpen(true)
  }

  function handleFieldSubmit(values: Omit<SchemaField, "id">) {
    if (fieldDialogMode === "add") {
      addField(id, { ...values, id: uuidv4() })
    } else if (editingField) {
      updateField(id, editingField.id, values)
    }
  }

  return (
    <div
      className={`w-64 rounded-lg border bg-card shadow-sm ${
        selected ? "border-primary" : "border-border"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-lg border-b bg-muted/50 px-3 py-2">
        {isEditingName ? (
          <input
            ref={nameInputRef}
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitName()
              if (e.key === "Escape") {
                setNameDraft(data.name)
                setIsEditingName(false)
              }
            }}
            className="w-full bg-transparent text-sm font-medium outline-none"
            autoFocus
          />
        ) : (
          <span
            onDoubleClick={() => setIsEditingName(true)}
            className="truncate text-sm font-medium"
            title="Double-click to rename"
          >
            {data.name}
          </span>
        )}
        <button
          onClick={() => deleteTable(id)}
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Delete ${data.name} table`}
        >
          <Trash size={14} />
        </button>
      </div>

      {/* Fields */}
      <div className="divide-y">
        {data.fields.map((field) => (
          <div
            key={field.id}
            className="group relative flex items-center gap-2 px-3 py-1.5 text-xs"
          >
            <Handle
              type="target"
              position={Position.Left}
              id={field.id}
              className="h-2! w-2! border-border! bg-background!"
            />

            {field.isPrimaryKey && (
              <Key
                size={12}
                className="shrink-0 text-amber-600"
                aria-label="Primary key"
              />
            )}
            {!field.isPrimaryKey && field.isUnique && (
              <Asterisk
                size={12}
                className="shrink-0 text-muted-foreground"
                aria-label="Unique"
              />
            )}

            <button
              onClick={() => openEditFieldDialog(field)}
              className="flex flex-1 items-center justify-between gap-2 truncate text-left"
            >
              <span className="truncate">{field.name}</span>
              <span className="text-muted-foreground">{field.type}</span>
            </button>

            <button
              onClick={() => deleteField(id, field.id)}
              className="hidden text-muted-foreground group-hover:block hover:text-destructive"
              aria-label={`Delete ${field.name} field`}
            >
              <Trash size={12} />
            </button>

            <Handle
              type="source"
              position={Position.Right}
              id={field.id}
              className="h-2! w-2! border-border! bg-background!"
            />
          </div>
        ))}
      </div>

      {/* Add field */}
      <Button
        variant="ghost"
        size="sm"
        onClick={openAddFieldDialog}
        className="w-full justify-start rounded-t-none text-xs text-muted-foreground"
      >
        <Plus size={12} />
        Add field
      </Button>

      <FieldFormDialog
        open={fieldDialogOpen}
        onOpenChange={setFieldDialogOpen}
        mode={fieldDialogMode}
        initialField={editingField}
        onSubmit={handleFieldSubmit}
      />
    </div>
  )
}
