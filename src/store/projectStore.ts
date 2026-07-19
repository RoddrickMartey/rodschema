// src/store/projectStore.ts
import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"
import type { ProjectSummary, Project } from "@/types/project.types"
import type { CanvasState } from "@/types/schema.types"
import { useCanvasStore } from "./canvasStore"
import { projectStorage } from "@/lib/storage/projectStorage"
import { toCanvasState, fromCanvasState } from "@/lib/canvas/canvasConverters"

const LAST_PROJECT_KEY = "rodschema:last-project-id"

type ProjectStore = {
  currentProjectId: string | null
  currentProjectName: string | null
  projects: ProjectSummary[]
  isSaving: boolean
  isDirty: boolean

  refreshProjectList: () => Promise<void>
  createProject: (name: string) => Promise<void>
  openProject: (id: string) => Promise<void>
  saveCurrentProject: () => Promise<void>
  renameProject: (id: string, name: string) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  markDirty: () => void
  // Attempts to reopen whatever project was open when the page was last
  // reloaded — called once on app mount
  restoreLastProject: () => Promise<void>
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  currentProjectId: null,
  currentProjectName: null,
  projects: [],
  isSaving: false,
  isDirty: false,

  refreshProjectList: async () => {
    const projects = await projectStorage.listProjects()
    set({ projects })
  },

  createProject: async (name) => {
    const now = new Date().toISOString()
    const project: Project = {
      id: uuidv4(),
      name,
      createdAt: now,
      updatedAt: now,
      canvasState: { tables: [], relations: [] },
    }
    await projectStorage.createProject(project)
    useCanvasStore.getState().resetCanvas()
    set({
      currentProjectId: project.id,
      currentProjectName: project.name,
      isDirty: false,
    })
    localStorage.setItem(LAST_PROJECT_KEY, project.id)
    await get().refreshProjectList()
  },

  openProject: async (id) => {
    const project = await projectStorage.getProject(id)
    if (!project) return
    const { nodes, edges } = fromCanvasState(project.canvasState)
    useCanvasStore.getState().loadCanvas(nodes, edges)
    set({
      currentProjectId: project.id,
      currentProjectName: project.name,
      isDirty: false,
    })
    localStorage.setItem(LAST_PROJECT_KEY, project.id)
  },

  saveCurrentProject: async () => {
    const { currentProjectId } = get()
    if (!currentProjectId) return
    set({ isSaving: true })
    const { nodes, edges } = useCanvasStore.getState()
    const canvasState: CanvasState = toCanvasState(nodes, edges)
    await projectStorage.updateProject(currentProjectId, canvasState)
    set({ isSaving: false, isDirty: false })
    await get().refreshProjectList() // updatedAt changed
  },

  renameProject: async (id, name) => {
    await projectStorage.renameProject(id, name)
    if (get().currentProjectId === id) set({ currentProjectName: name })
    await get().refreshProjectList()
  },

  deleteProject: async (id) => {
    await projectStorage.deleteProject(id)
    if (get().currentProjectId === id) {
      useCanvasStore.getState().resetCanvas()
      set({ currentProjectId: null, currentProjectName: null })
      localStorage.removeItem(LAST_PROJECT_KEY)
    }
    await get().refreshProjectList()
  },

  markDirty: () => set({ isDirty: true }),

  restoreLastProject: async () => {
    const lastId = localStorage.getItem(LAST_PROJECT_KEY)
    if (!lastId) return

    // Confirm the project still actually exists before trying to open it —
    // it may have been deleted since the last session
    const project = await projectStorage.getProject(lastId)
    if (!project) {
      localStorage.removeItem(LAST_PROJECT_KEY)
      return
    }

    await get().openProject(lastId)
  },
}))
