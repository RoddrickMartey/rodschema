import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type AboutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  // We only allow the state to change if it's explicitly set to true (opening),
  // meaning closing from background/Escape clicks will be ignored here.
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen === true) {
      onOpenChange(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="[&>button]:hidden" // Hides the default corner button if preferred
        // or use: showCloseButton={false} if your wrapper supports it
      >
        <DialogHeader>
          <DialogTitle>About RodSchema</DialogTitle>
          <DialogDescription>
            An interactive, canvas-based tool for visually architecting database
            schemas and instantly generating SQL, Prisma, and SQLAlchemy code.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Version 0.0.1</p>
          <p>Built with React, React Flow, and Zustand.</p>
          <p>Runs entirely in your browser — no account, no server.</p>
        </div>

        <DialogFooter>
          {/* This bypasses handleOpenChange and forces the modal shut directly */}
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
