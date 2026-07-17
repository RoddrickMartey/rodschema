// src/types/reactflow.types.ts
// The React Flow-specific wrapper — keeps RF's shape out of your domain types
import type { Node, Edge } from "@xyflow/react"
import type { Table, Relation } from "./schema.types"

export type TableNode = Node<Table, "tableNode">
export type RelationEdge = Edge<{ relation: Relation }, "relationEdge">
