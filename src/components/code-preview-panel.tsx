import { useState } from "react"
import { Check, Copy, AlertTriangle, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useCompiledSchema } from "@/hooks/useCompiledSchema"
import type { GeneratedTarget } from "@/lib/export/exportImport"

const TABS: { value: GeneratedTarget; label: string }[] = [
  { value: "sql", label: "SQL" },
  { value: "prisma", label: "Prisma" },
  { value: "sqlalchemy", label: "SQLAlchemy" },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied" : "Copy"}
    </Button>
  )
}

export function CodePreviewPanel() {
  const { output, issues, hasErrors, isCompiling } = useCompiledSchema()

  return (
    <div className="flex h-full flex-col border-l bg-background">
      {/* Validation issues — shown whenever any exist, regardless of whether
          generation succeeded, so warnings aren't hidden once errors clear */}
      {issues.length > 0 && (
        <div className="border-b p-3">
          <ul className="space-y-1.5">
            {issues.map((issue, i) => (
              <li
                key={i}
                className={`flex items-start gap-2 text-xs ${
                  issue.severity === "error"
                    ? "text-destructive"
                    : "text-amber-600"
                }`}
              >
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasErrors || !output ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
          {hasErrors
            ? "Fix the errors above to see generated code."
            : "Add a table to see generated code."}
        </div>
      ) : (
        <Tabs
          defaultValue="sql"
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between border-b px-2 py-1">
            <TabsList>
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {isCompiling && (
              <Loader2
                size={14}
                className="mr-2 animate-spin text-muted-foreground"
              />
            )}
          </div>

          {TABS.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="flex-1 overflow-hidden"
            >
              <div className="flex justify-end px-2 pt-1">
                <CopyButton text={output[tab.value]} />
              </div>
              <ScrollArea className="h-full px-3 pb-3">
                <pre className="text-xs">
                  <code>{output[tab.value]}</code>
                </pre>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
