import { useState } from "react"
import {
  EdgeLabelRenderer,
  getBezierPath,
  Position,
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

const ARROW_SIZE = 10

// Calculates triangle points pointing INTO the target handle
function getArrowPoints(
  x: number,
  y: number,
  position: Position,
  size: number
) {
  switch (position) {
    case Position.Left:
      // Handle is on Left side -> Edge enters moving Right -> Tip at (x, y), base extends Left (x - size)
      return `${x},${y} ${x - size},${y - size / 2} ${x - size},${y + size / 2}`
    case Position.Right:
      // Handle is on Right side -> Edge enters moving Left -> Tip at (x, y), base extends Right (x + size)
      return `${x},${y} ${x + size},${y - size / 2} ${x + size},${y + size / 2}`
    case Position.Top:
      // Handle is on Top side -> Edge enters moving Down -> Tip at (x, y), base extends Up (y - size)
      return `${x},${y} ${x - size / 2},${y - size} ${x + size / 2},${y - size}`
    case Position.Bottom:
      // Handle is on Bottom side -> Edge enters moving Up -> Tip at (x, y), base extends Down (y + size)
      return `${x},${y} ${x - size / 2},${y + size} ${x + size / 2},${y + size}`
    default:
      return `${x},${y} ${x - size},${y - size / 2} ${x - size},${y + size / 2}`
  }
}

export function RelationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
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

  const arrowPoints = getArrowPoints(
    targetX,
    targetY,
    targetPosition,
    ARROW_SIZE
  )

  const color = selected ? "#2563eb" : "#71717a"

  return (
    <>
      <path
        id={id}
        d={edgePath}
        fill="none"
        style={{
          stroke: color,
          strokeWidth: selected ? 2.5 : 2,
        }}
      />
      <polygon
        points={arrowPoints}
        style={{
          fill: color,
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <button className="rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium shadow-sm hover:border-primary" />
              }
            >
              {TYPE_LABELS[relationType]}
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
