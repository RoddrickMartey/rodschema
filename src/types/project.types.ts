// src/types/project.types.ts
import { z } from "zod"
import { CanvasStateSchema } from "./schema.types"

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Project name is required"),
  createdAt: z.string(), // ISO string — plain strings serialize cleanly to/from IndexedDB and JSON export
  updatedAt: z.string(),
  canvasState: CanvasStateSchema,
})
export type Project = z.infer<typeof ProjectSchema>

// Lightweight shape for list views — avoids pulling every table/field/relation
// into memory just to render a "my projects" list
export const ProjectSummarySchema = ProjectSchema.pick({
  id: true,
  name: true,
  updatedAt: true,
})
export type ProjectSummary = z.infer<typeof ProjectSummarySchema>
