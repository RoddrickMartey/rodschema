import { useEffect, useRef } from "react"
import { useCanvasStore } from "@/store/canvasStore"
import { useProjectStore } from "@/store/projectStore"

const AUTOSAVE_DEBOUNCE_MS = 1000

/**
 * Watches the live canvas (nodes/edges) and saves to IndexedDB shortly
 * after edits settle. Without this, canvasStore only ever exists in
 * memory — a page reload would silently lose everything since edits
 * were never actually written back to the saved project.
 */
export function useProjectAutosave() {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const currentProjectId = useProjectStore((s) => s.currentProjectId)
  const saveCurrentProject = useProjectStore((s) => s.saveCurrentProject)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRun = useRef(true)

  useEffect(() => {
    // Skip the very first run — that fires right after openProject/createProject
    // loads a project, which isn't an edit and shouldn't trigger a save
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }

    if (!currentProjectId) return

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      saveCurrentProject()
    }, AUTOSAVE_DEBOUNCE_MS)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges])

  // Reset the "skip first run" guard whenever the open project changes,
  // so switching projects doesn't immediately re-save the one just opened
  useEffect(() => {
    isFirstRun.current = true
  }, [currentProjectId])
}
