import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type ProjectNameDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "rename"
  initialName?: string
  onSubmit: (name: string) => void
}

export function ProjectNameDialog({
  open,
  onOpenChange,
  mode,
  initialName = "",
  onSubmit,
}: ProjectNameDialogProps) {
  const [name, setName] = useState(initialName)

  // Reset the field to the current name each time the dialog opens,
  // rather than carrying over whatever was typed last time
  // Defer resetting the field when the dialog opens to avoid
  // synchronous setState inside the effect which can cause
  // cascading renders.
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => setName(initialName), 0)
    return () => clearTimeout(id)
  }, [open, initialName])

  const trimmed = name.trim()
  const isValid = trimmed.length > 0

  function handleSubmit() {
    if (!isValid) return
    onSubmit(trimmed)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New project" : "Rename project"}
          </DialogTitle>
        </DialogHeader>

        <Field>
          <FieldLabel htmlFor="project-name">Project name</FieldLabel>
          <Input
            id="project-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit()
            }}
            autoFocus
          />
        </Field>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
