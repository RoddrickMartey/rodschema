import { Button } from "@/components/ui/button"
import { Handshake } from "lucide-react"

export function App() {
  const handleLogFiles = () => {
    // Vite scans the folder at build time.
    // '**/*' means 'grab all files in all subfolders'
    const modules = import.meta.glob("./**/*")

    // Get just the relative file paths
    const filePaths = Object.keys(modules)

    console.log("Your project files:", filePaths)
  }

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <Button className="mt-2" onClick={handleLogFiles}>
            Log Files
            <Handshake />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App
