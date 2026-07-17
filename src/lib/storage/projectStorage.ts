import { openDB, type IDBPDatabase } from "idb"
import type { Project, ProjectSummary } from "@/types/project.types"
import type { CanvasState } from "@/types/schema.types"

const DB_NAME = "rodschema"
const DB_VERSION = 1
const STORE_NAME = "projects"

let dbInstance: IDBPDatabase | null = null

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    },
  })

  return dbInstance
}

export const projectStorage = {
  async init(): Promise<void> {
    await getDB()
  },

  async createProject(project: Project): Promise<Project> {
    const db = await getDB()
    await db.put(STORE_NAME, project)
    return project
  },

  async getProject(id: string): Promise<Project | undefined> {
    const db = await getDB()
    return db.get(STORE_NAME, id)
  },

  async listProjects(): Promise<ProjectSummary[]> {
    const db = await getDB()
    const all: Project[] = await db.getAll(STORE_NAME)
    return all
      .map(({ id, name, updatedAt }) => ({ id, name, updatedAt }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) // most recently edited first
  },

  async updateProject(id: string, canvasState: CanvasState): Promise<void> {
    const db = await getDB()
    const existing = await db.get(STORE_NAME, id)
    if (!existing) throw new Error(`Project ${id} not found`)

    const updated: Project = {
      ...existing,
      canvasState,
      updatedAt: new Date().toISOString(),
    }
    await db.put(STORE_NAME, updated)
  },

  async renameProject(id: string, name: string): Promise<void> {
    const db = await getDB()
    const existing = await db.get(STORE_NAME, id)
    if (!existing) throw new Error(`Project ${id} not found`)

    const updated: Project = {
      ...existing,
      name,
      updatedAt: new Date().toISOString(),
    }
    await db.put(STORE_NAME, updated)
  },

  async deleteProject(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAME, id)
  },
}
