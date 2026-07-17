import type { TableNode, RelationEdge } from "@/types/reactflow.types"
import type { CanvasState, Table, Relation } from "@/types/schema.types"

/**
 * Converts the live React Flow graph (nodes/edges) into the
 * domain CanvasState shape used for saving (IndexedDB) and export.
 */
export function toCanvasState(
  nodes: TableNode[],
  edges: RelationEdge[]
): CanvasState {
  const tables: Table[] = nodes.map((node) => ({
    ...node.data,
    position: node.position, // position can drift from data.position while dragging, so always take it from the node itself
  }))

  const relations: Relation[] = edges.map((edge) => edge.data!.relation)

  return { tables, relations }
}

/**
 * Converts a saved/imported CanvasState back into React Flow's
 * nodes/edges shape, for loading into the canvas.
 */
export function fromCanvasState(canvasState: CanvasState): {
  nodes: TableNode[]
  edges: RelationEdge[]
} {
  const nodes: TableNode[] = canvasState.tables.map((table) => ({
    id: table.id,
    type: "tableNode",
    position: table.position,
    data: table,
  }))

  const edges: RelationEdge[] = canvasState.relations.map((relation) => ({
    id: relation.id,
    source: relation.from.tableId,
    target: relation.to.tableId,
    sourceHandle: relation.from.fieldId,
    targetHandle: relation.to.fieldId,
    type: "relationEdge",
    data: { relation },
  }))

  return { nodes, edges }
}
