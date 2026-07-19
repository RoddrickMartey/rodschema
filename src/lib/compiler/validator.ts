import type { CanvasState } from "@/types/schema.types"
import { buildFieldLookup, type ValidationIssue } from "./compiler.types"
import { detectDuplicateNames } from "./duplicateNames"

/**
 * Detects circular foreign key dependencies by treating relations as a
 * directed graph (from.tableId -> to.tableId) and running DFS cycle detection.
 *
 * Uses the classic three-color approach: white (unvisited), gray (in progress
 * on the current DFS path), black (fully explored). A cycle exists if we ever
 * reach a gray node again.
 */
export function detectCircularForeignKeys(
  canvasState: CanvasState
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // Build adjacency list: tableId -> [{ toTableId, relationId }]
  const adjacency = new Map<
    string,
    { toTableId: string; relationId: string }[]
  >()
  for (const table of canvasState.tables) {
    adjacency.set(table.id, [])
  }
  for (const relation of canvasState.relations) {
    adjacency.get(relation.from.tableId)?.push({
      toTableId: relation.to.tableId,
      relationId: relation.id,
    })
  }

  const WHITE = 0,
    GRAY = 1,
    BLACK = 2
  const color = new Map<string, number>()
  for (const table of canvasState.tables) color.set(table.id, WHITE)

  const pathRelationIds: string[] = []

  function dfs(tableId: string): boolean {
    color.set(tableId, GRAY)

    for (const edge of adjacency.get(tableId) ?? []) {
      pathRelationIds.push(edge.relationId)

      if (color.get(edge.toTableId) === GRAY) {
        // Found a cycle — edge.toTableId is already on the current path
        const cycleTableIds = [...pathRelationIds]
          .map((relId) => canvasState.relations.find((r) => r.id === relId))
          .filter((r): r is NonNullable<typeof r> => r !== undefined)
          .flatMap((r) => [r.from.tableId, r.to.tableId])

        issues.push({
          severity: "error",
          message: "Circular foreign key dependency detected between tables.",
          tableIds: [...new Set(cycleTableIds)],
          relationId: edge.relationId,
        })
        pathRelationIds.pop()
        return true
      }

      if (color.get(edge.toTableId) === WHITE) {
        if (dfs(edge.toTableId)) {
          pathRelationIds.pop()
          return true
        }
      }

      pathRelationIds.pop()
    }

    color.set(tableId, BLACK)
    return false
  }

  for (const table of canvasState.tables) {
    if (color.get(table.id) === WHITE) {
      dfs(table.id)
    }
  }

  return issues
}

/**
 * Flags relations where the connected fields have mismatched data types —
 * e.g. a UUID primary key linked to a VARCHAR foreign key.
 */
export function detectTypeMismatches(
  canvasState: CanvasState
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const lookup = buildFieldLookup(canvasState)

  for (const relation of canvasState.relations) {
    const fromEntry = lookup.get(relation.from.fieldId)
    const toEntry = lookup.get(relation.to.fieldId)

    // Dangling reference — field was deleted but relation wasn't cleaned up
    if (!fromEntry || !toEntry) {
      issues.push({
        severity: "error",
        message: "Relation references a field that no longer exists.",
        tableIds: [relation.from.tableId, relation.to.tableId],
        relationId: relation.id,
      })
      continue
    }

    if (fromEntry.field.type !== toEntry.field.type) {
      issues.push({
        severity: "error",
        message: `Type mismatch: ${fromEntry.table.name}.${fromEntry.field.name} (${fromEntry.field.type}) does not match ${toEntry.table.name}.${toEntry.field.name} (${toEntry.field.type}).`,
        tableIds: [relation.from.tableId, relation.to.tableId],
        relationId: relation.id,
      })
    }
  }

  return issues
}

/**
 * Runs all validation checks and returns the combined list of issues.
 * This is the single entry point the UI and generators should call.
 */
export function validateCanvasState(
  canvasState: CanvasState
): ValidationIssue[] {
  return [
    ...detectCircularForeignKeys(canvasState),
    ...detectTypeMismatches(canvasState),
    ...detectDuplicateNames(canvasState),
  ]
}
