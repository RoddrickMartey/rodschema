import type { CanvasState } from "@/types/schema.types"
import type { GeneratorOptions, ValidationIssue } from "./compiler.types"
import { validateCanvasState } from "./validator"
import { generateSQL } from "./generators/sql.generator"
import { generatePrismaSchema } from "./generators/prisma.generator"
import { generateSQLAlchemy } from "./generators/sqlalchemy.generator"

export type CompiledOutput = {
  sql: string
  prisma: string
  sqlalchemy: string
}

export type CompileResult = {
  issues: ValidationIssue[]
  hasErrors: boolean // true if any issue has severity "error"
  output: CompiledOutput | null // null when hasErrors is true — generation is skipped
}

/**
 * Single entry point for turning canvas state into generated code.
 * Runs validation first; if any error-severity issues are found, generation
 * is skipped entirely (a schema with a circular FK or type mismatch can't
 * produce meaningful SQL/Prisma/SQLAlchemy output). Warnings don't block
 * generation — they're surfaced alongside the output for the UI to display.
 */
export function compileSchema(
  canvasState: CanvasState,
  options?: GeneratorOptions
): CompileResult {
  const issues = validateCanvasState(canvasState)
  const hasErrors = issues.some((issue) => issue.severity === "error")

  if (hasErrors) {
    return { issues, hasErrors, output: null }
  }

  const output: CompiledOutput = {
    sql: generateSQL(canvasState, options),
    prisma: generatePrismaSchema(canvasState, options),
    sqlalchemy: generateSQLAlchemy(canvasState, options),
  }

  return { issues, hasErrors, output }
}
