import { useCallback } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  type Connection,
  type IsValidConnection,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { v4 as uuidv4 } from "uuid"
import { useCanvasStore } from "@/store/canvasStore"
import { TableNode } from "./table-node"
import { RelationEdge as RelationEdgeComponent } from "./relation-edge"
import { canFieldsConnect } from "@/lib/canvas/connectionValidator"
import type {
  TableNode as TableNodeType,
  RelationEdge,
} from "@/types/reactflow.types"

const nodeTypes = { tableNode: TableNode }
const edgeTypes = { relationEdge: RelationEdgeComponent }

export function Canvas() {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const onNodesChange = useCanvasStore((s) => s.onNodesChange)
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange)
  const addRelation = useCanvasStore((s) => s.addRelation)

  // Looks up the actual Field object behind a tableId/fieldId pair —
  // needed because isValidConnection only gets raw ids from React Flow,
  // but canFieldsConnect needs the real Field (type, isPrimaryKey, isUnique)
  function findField(
    tableId: string | null,
    fieldId: string | null | undefined
  ) {
    if (!tableId || !fieldId) return undefined
    const node = nodes.find((n) => n.id === tableId) as
      TableNodeType | undefined
    return node?.data.fields.find((f) => f.id === fieldId)
  }

  const isValidConnection: IsValidConnection = useCallback(
    (connection) => {
      const fromField = findField(connection.source, connection.sourceHandle)
      const toField = findField(connection.target, connection.targetHandle)
      if (!fromField || !toField) return false

      return canFieldsConnect(fromField, toField).isValid
    },
    [nodes]
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.sourceHandle || !connection.targetHandle) return

      // from = child/FK-holding side (source handle), to = parent/referenced
      // side (target handle) — same convention the generators assume
      const relationId = uuidv4()
      const newEdge: RelationEdge = {
        id: relationId,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: "relationEdge",
        data: {
          relation: {
            id: relationId,
            from: {
              tableId: connection.source,
              fieldId: connection.sourceHandle,
            },
            to: {
              tableId: connection.target,
              fieldId: connection.targetHandle,
            },
            // Default — the actual cardinality is a modeling choice the user
            // can change afterward; one-to-many is the most common case
            type: "one-to-many",
          },
        },
      }

      addRelation(newEdge)
    },
    [addRelation]
  )

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls className="dark:text-background" />
      </ReactFlow>
    </div>
  )
}
