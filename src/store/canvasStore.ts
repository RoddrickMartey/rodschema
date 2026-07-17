// src/store/canvasStore.ts
import { create } from "zustand"
import type { OnNodesChange, OnEdgesChange, Viewport } from "@xyflow/react"
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react"
import type { TableNode, RelationEdge } from "@/types/reactflow.types"
import type { Table, Field } from "@/types/schema.types"

type CanvasStore = {
  nodes: TableNode[]
  edges: RelationEdge[]
  viewport: Viewport
  selectedNodeId: string | null

  // React Flow wiring
  onNodesChange: OnNodesChange<TableNode>
  onEdgesChange: OnEdgesChange<RelationEdge>
  setViewport: (viewport: Viewport) => void

  // Domain actions
  addTable: (table: Table) => void
  updateTable: (tableId: string, updates: Partial<Table>) => void
  deleteTable: (tableId: string) => void
  addField: (tableId: string, field: Field) => void
  updateField: (
    tableId: string,
    fieldId: string,
    updates: Partial<Field>
  ) => void
  deleteField: (tableId: string, fieldId: string) => void
  addRelation: (edge: RelationEdge) => void
  deleteRelation: (relationId: string) => void
  selectNode: (nodeId: string | null) => void

  // Load / reset (used when switching or opening projects)
  loadCanvas: (nodes: TableNode[], edges: RelationEdge[]) => void
  resetCanvas: () => void
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedNodeId: null,

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),
  setViewport: (viewport) => set({ viewport }),

  addTable: (table) =>
    set({
      nodes: [
        ...get().nodes,
        {
          id: table.id,
          type: "tableNode",
          position: table.position,
          data: table,
        },
      ],
    }),

  updateTable: (tableId, updates) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === tableId ? { ...n, data: { ...n.data, ...updates } } : n
      ),
    }),

  deleteTable: (tableId) =>
    set({
      nodes: get().nodes.filter((n) => n.id !== tableId),
      edges: get().edges.filter(
        (e) => e.source !== tableId && e.target !== tableId
      ),
    }),

  addField: (tableId, field) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === tableId
          ? { ...n, data: { ...n.data, fields: [...n.data.fields, field] } }
          : n
      ),
    }),

  updateField: (tableId, fieldId, updates) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === tableId
          ? {
              ...n,
              data: {
                ...n.data,
                fields: n.data.fields.map((f) =>
                  f.id === fieldId ? { ...f, ...updates } : f
                ),
              },
            }
          : n
      ),
    }),

  deleteField: (tableId, fieldId) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === tableId
          ? {
              ...n,
              data: {
                ...n.data,
                fields: n.data.fields.filter((f) => f.id !== fieldId),
              },
            }
          : n
      ),
    }),

  addRelation: (edge) => set({ edges: [...get().edges, edge] }),

  deleteRelation: (relationId) =>
    set({ edges: get().edges.filter((e) => e.id !== relationId) }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  loadCanvas: (nodes, edges) => set({ nodes, edges, selectedNodeId: null }),

  resetCanvas: () =>
    set({
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedNodeId: null,
    }),
}))
