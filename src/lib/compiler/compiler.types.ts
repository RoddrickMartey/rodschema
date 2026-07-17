import type { CanvasState, Table, Field } from "@/types/schema.types"

export type ValidationSeverity = "error" | "warning"

export type ValidationIssue = {
  severity: ValidationSeverity
  message: string
  // Which parts of the canvas this issue relates to, so the UI can highlight them
  tableIds: string[]
  relationId?: string
}

export type GeneratorOptions = {
  author?: string
}

// Small internal helper type used by the validator — a flattened lookup
// so we're not repeatedly searching nested arrays for a field by id
export type FieldLookup = Map<string, { table: Table; field: Field }>

export function buildFieldLookup(canvasState: CanvasState): FieldLookup {
  const lookup: FieldLookup = new Map()
  for (const table of canvasState.tables) {
    for (const field of table.fields) {
      lookup.set(field.id, { table, field })
    }
  }
  return lookup
}
