import { useState } from "react"
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react"
import { Trash, ArrowLeftRight } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useCanvasStore } from "@/store/canvasStore"
import type { RelationEdge as RelationEdgeType } from "@/types/reactflow.types"
import type { RelationType } from "@/types/schema.types"

const TYPE_LABELS: Record<RelationType, string> = {
  "one-to-one": "1:1",
  "one-to-many": "1:N",
  "many-to-many": "N:N",
}

const ALL_TYPES = Object.keys(TYPE_LABELS) as RelationType[]

export function RelationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
  selected,
}: EdgeProps<RelationEdgeType>) {
  const updateRelation = useCanvasStore((s) => s.updateRelation)
  const flipRelation = useCanvasStore((s) => s.flipRelation)
  const deleteRelation = useCanvasStore((s) => s.deleteRelation)
  const [open, setOpen] = useState(false)

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const relationType = data?.relation.type ?? "one-to-many"

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ strokeWidth: selected ? 2 : 1 }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          // nodrag/nopan stop React Flow from treating this label as part of
          // the canvas's own drag/pan gestures
          className="nodrag nopan"
        >
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>
              <button className="rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium shadow-sm hover:border-primary">
                {TYPE_LABELS[relationType]}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1" align="center">
              <div className="flex flex-col">
                {ALL_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      updateRelation(id, { type })
                      setOpen(false)
                    }}
                    className={`rounded px-2 py-1.5 text-left text-xs hover:bg-muted ${
                      type === relationType ? "font-medium" : ""
                    }`}
                  >
                    {TYPE_LABELS[type]} — {type}
                  </button>
                ))}
                <div className="my-1 border-t" />
                <button
                  onClick={() => {
                    flipRelation(id)
                    setOpen(false)
                  }}
                  className="flex items-center gap-1.5 rounded px-2 py-1.5 text-left text-xs hover:bg-muted"
                >
                  <ArrowLeftRight size={12} />
                  Flip direction
                </button>
                <div className="my-1 border-t" />
                <button
                  onClick={() => {
                    deleteRelation(id)
                    setOpen(false)
                  }}
                  className="flex items-center gap-1.5 rounded px-2 py-1.5 text-left text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash size={12} />
                  Delete relation
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
