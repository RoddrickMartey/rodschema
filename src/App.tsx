import { useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toolbar } from "@/components/toolbar"
import { Canvas } from "@/components/canvas"
import { CodePreviewPanel } from "@/components/code-preview-panel"
import { EmptyProjectState } from "@/components/empty-project-state"
import { useProjectStore } from "@/store/projectStore"
import { useProjectAutosave } from "@/hooks/useProjectAutosave"

export function App() {
  const currentProjectId = useProjectStore((s) => s.currentProjectId)
  const restoreLastProject = useProjectStore((s) => s.restoreLastProject)

  // Autosave the open project as the canvas changes
  useProjectAutosave()

  // Reopen whatever project was open last time, once on mount
  useEffect(() => {
    restoreLastProject()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="h-screen w-full">
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset>
          <main className="flex h-full flex-col">
            {currentProjectId ? (
              <>
                <Toolbar />
                <div className="flex flex-1 overflow-hidden">
                  <div className="flex-1">
                    <Canvas />
                  </div>
                  <div className="w-96 shrink-0">
                    <CodePreviewPanel />
                  </div>
                </div>
              </>
            ) : (
              <EmptyProjectState />
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default App
