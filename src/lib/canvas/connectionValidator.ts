import type { Field } from "@/types/schema.types"

export type ConnectionCheckResult = {
  isValid: boolean
  reason?: string
}

/**
 * Checks whether two fields can legally be connected as a relation,
 * called live while the user is drawing a connection on the canvas
 * (before the relation is created) — this is what powers the
 * "live linting" feature, catching bad connections at the moment of
 * creation rather than after the fact.
 */
export function canFieldsConnect(
  fromField: Field,
  toField: Field
): ConnectionCheckResult {
  if (fromField.id === toField.id) {
    return { isValid: false, reason: "A field cannot connect to itself." }
  }

  if (fromField.type !== toField.type) {
    return {
      isValid: false,
      reason: `Type mismatch: ${fromField.type} cannot connect to ${toField.type}.`,
    }
  }

  // By convention the "to" side (the referenced/parent side) should be a
  // primary key or unique field — a foreign key referencing a plain,
  // non-unique column isn't a meaningful relational constraint.
  if (!toField.isPrimaryKey && !toField.isUnique) {
    return {
      isValid: false,
      reason: `"${toField.name}" must be a primary key or unique field to be referenced.`,
    }
  }

  return { isValid: true }
}
