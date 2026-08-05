import {
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
} from "@xyflow/react"
import { toPng } from "html-to-image"

const IMAGE_PADDING = 0.1
const MIN_ZOOM = 0.5
const MAX_ZOOM = 2

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

/**
 * Exports the current canvas as a PNG — captures exactly what's on screen
 * (tables, fields, relationship lines and labels), sized to fit all nodes
 * regardless of the current pan/zoom position.
 */
export function useExportDiagramPng() {
  const { getNodes } = useReactFlow()

  async function exportDiagramAsPng(projectName: string) {
    const nodes = getNodes()
    if (nodes.length === 0) return

    const bounds = getNodesBounds(nodes)
    const imageWidth = Math.max(bounds.width + 200, 800)
    const imageHeight = Math.max(bounds.height + 200, 600)

    const viewport = getViewportForBounds(
      bounds,
      imageWidth,
      imageHeight,
      MIN_ZOOM,
      MAX_ZOOM,
      IMAGE_PADDING
    )

    const viewportEl = document.querySelector(
      ".react-flow__viewport"
    ) as HTMLElement | null
    if (!viewportEl) return

    const dataUrl = await toPng(viewportEl, {
      backgroundColor: "#ffffff",
      width: imageWidth,
      height: imageHeight,
      // Exclude the controls/minimap UI chrome — only the diagram itself
      // should appear in the exported image
      filter: (node) =>
        !(
          node?.classList?.contains("react-flow__controls") ||
          node?.classList?.contains("react-flow__minimap")
        ),
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    })

    const link = document.createElement("a")
    link.download = `${slugify(projectName)}-diagram.png`
    link.href = dataUrl
    link.click()
  }

  return { exportDiagramAsPng }
}
