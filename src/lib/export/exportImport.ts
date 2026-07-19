import { CanvasStateSchema, type CanvasState } from "@/types/schema.types"
import type { CompiledOutput } from "@/lib/compiler/compileSchema"

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()

  // Revoke on next tick — must happen after the click has been processed by the browser
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/**
 * Exports the raw CanvasState as a .json file — this is what a user re-imports
 * later, and the mechanism for sharing a project with someone else.
 */
export function exportProjectAsJSON(
  canvasState: CanvasState,
  projectName: string
): void {
  const content = JSON.stringify(canvasState, null, 2)
  downloadTextFile(content, `${slugify(projectName)}.json`, "application/json")
}

const GENERATED_FILE_CONFIG = {
  sql: { extension: "sql", mimeType: "application/sql" },
  prisma: { extension: "prisma", mimeType: "text/plain" },
  sqlalchemy: { extension: "py", mimeType: "text/x-python" },
} as const

export type GeneratedTarget = keyof typeof GENERATED_FILE_CONFIG

/**
 * Exports one of the compiler's generated outputs (SQL/Prisma/SQLAlchemy)
 * as a downloadable file with the correct extension.
 */
export function exportGeneratedCode(
  output: CompiledOutput,
  target: GeneratedTarget,
  projectName: string
): void {
  const { extension, mimeType } = GENERATED_FILE_CONFIG[target]
  const filenameBase = target === "prisma" ? "schema" : slugify(projectName)
  downloadTextFile(output[target], `${filenameBase}.${extension}`, mimeType)
}

export type ImportResult =
  | { success: true; canvasState: CanvasState }
  | { success: false; error: string }

/**
 * Parses and validates an uploaded .json file back into a CanvasState.
 * Runs it through the Zod schema so a hand-edited or corrupted file
 * fails with a clear error instead of silently loading broken data.
 */
export async function importProjectFromJSON(file: File): Promise<ImportResult> {
  let raw: unknown

  try {
    const text = await file.text()
    raw = JSON.parse(text)
  } catch {
    return { success: false, error: "File is not valid JSON." }
  }

  const parsed = CanvasStateSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: `File doesn't match the expected schema format: ${parsed.error.issues[0]?.message ?? "unknown error"}`,
    }
  }

  return { success: true, canvasState: parsed.data }
}
