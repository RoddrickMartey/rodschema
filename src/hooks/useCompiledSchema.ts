// src/hooks/useCompiledSchema.ts
import { useEffect, useRef, useState } from "react"
import { useCanvasStore } from "@/store/canvasStore"
import { toCanvasState } from "@/lib/canvas/canvasConverters"
import { compileSchema, type CompileResult } from "@/lib/compiler/compileSchema"
import { userSettingsStorage } from "@/lib/storage/userSettings"

const DEBOUNCE_MS = 400

const EMPTY_RESULT: CompileResult = { issues: [], hasErrors: false, output: null }

export function useCompiledSchema(): CompileResult & { isCompiling: boolean } {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)

  const [result, setResult] = useState<CompileResult>(EMPTY_RESULT)
  const [isCompiling, setIsCompiling] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const startCompilingTimeout = setTimeout(() => setIsCompiling(true), 0)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      clearTimeout(startCompilingTimeout)

      const canvasState = toCanvasState(nodes, edges)
      const author = userSettingsStorage.get()?.name
      const nextResult = compileSchema(canvasState, { author })

      setResult(nextResult)
      setIsCompiling(false)
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(startCompilingTimeout)

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [nodes, edges])

  return { ...result, isCompiling }
}