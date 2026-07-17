// src/types/schema.types.ts
import { z } from "zod"

// ---- Field ----
export const FieldTypeEnum = z.enum([
  "UUID",
  "VARCHAR",
  "TEXT",
  "INT",
  "BIGINT",
  "FLOAT",
  "BOOLEAN",
  "DATE",
  "TIMESTAMP",
  "JSON",
])
export type FieldType = z.infer<typeof FieldTypeEnum>

export const FieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Field name is required"),
  type: FieldTypeEnum,
  isPrimaryKey: z.boolean().default(false),
  isUnique: z.boolean().default(false),
  isNullable: z.boolean().default(true),
})
export type Field = z.infer<typeof FieldSchema>

// ---- Table ----
export const TableSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Table name is required"),
  position: z.object({ x: z.number(), y: z.number() }),
  fields: z.array(FieldSchema).min(1, "Table needs at least one field"),
})
export type Table = z.infer<typeof TableSchema>

// ---- Relation ----
export const RelationTypeEnum = z.enum([
  "one-to-one",
  "one-to-many",
  "many-to-many",
])
export type RelationType = z.infer<typeof RelationTypeEnum>

export const RelationEndpointSchema = z.object({
  tableId: z.string(),
  fieldId: z.string(),
})

export const RelationSchema = z.object({
  id: z.string(),
  from: RelationEndpointSchema,
  to: RelationEndpointSchema,
  type: RelationTypeEnum,
})
export type Relation = z.infer<typeof RelationSchema>

// ---- Canvas state (what gets saved / exported) ----
export const CanvasStateSchema = z.object({
  tables: z.array(TableSchema),
  relations: z.array(RelationSchema),
})
export type CanvasState = z.infer<typeof CanvasStateSchema>
