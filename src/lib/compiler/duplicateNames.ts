import type { CanvasState } from "@/types/schema.types"
import type { ValidationIssue } from "./compiler.types"

/**
 * Flags duplicate table names and duplicate field names within a single
 * table. Two tables named "User" (or two fields named "id" in one table)
 * would produce invalid SQL/Prisma/SQLAlchemy — CREATE TABLE twice, or a
 * struct with two identical property names — so this has to be caught
 * before generation, not discovered by a failing `prisma generate` later.
 *
 * Two severities:
 * - Exact match (identical casing) is always an error — this is a hard
 *   conflict in every one of the three output targets.
 * - Same name differing only by case (e.g. "User" vs "user") is a warning —
 *   PostgreSQL and Prisma would likely still treat these as distinct
 *   identifiers, but it's confusing enough to flag rather than allow silently.
 */
export function detectDuplicateNames(
  canvasState: CanvasState
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // --- Table name collisions ---
  const tableNameGroups = new Map<string, { id: string; name: string }[]>()
  for (const table of canvasState.tables) {
    const key = table.name.toLowerCase()
    const group = tableNameGroups.get(key) ?? []
    group.push({ id: table.id, name: table.name })
    tableNameGroups.set(key, group)
  }

  for (const group of tableNameGroups.values()) {
    if (group.length < 2) continue

    const exactMatches = group.filter((t) => t.name === group[0].name)
    const hasExactDuplicate = exactMatches.length > 1

    issues.push({
      severity: hasExactDuplicate ? "error" : "warning",
      message: hasExactDuplicate
        ? `Multiple tables are named "${group[0].name}". Table names must be unique.`
        : `Tables ${group.map((t) => `"${t.name}"`).join(", ")} differ only by letter case — this can cause confusing or conflicting generated code.`,
      tableIds: group.map((t) => t.id),
    })
  }

  // --- Field name collisions within each table ---
  for (const table of canvasState.tables) {
    const fieldNameGroups = new Map<string, string[]>()
    for (const field of table.fields) {
      const key = field.name.toLowerCase()
      const group = fieldNameGroups.get(key) ?? []
      group.push(field.name)
      fieldNameGroups.set(key, group)
    }

    for (const names of fieldNameGroups.values()) {
      if (names.length < 2) continue

      const hasExactDuplicate = names.filter((n) => n === names[0]).length > 1

      issues.push({
        severity: hasExactDuplicate ? "error" : "warning",
        message: hasExactDuplicate
          ? `Table "${table.name}" has multiple fields named "${names[0]}". Field names must be unique within a table.`
          : `Table "${table.name}" has fields differing only by letter case (${names.map((n) => `"${n}"`).join(", ")}).`,
        tableIds: [table.id],
      })
    }
  }

  return issues
}
