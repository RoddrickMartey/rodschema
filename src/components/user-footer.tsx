import { useState } from "react"
import { Pencil, Monitor, Sun, Moon, Info } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { userSettingsStorage } from "@/lib/storage/userSettings"
import { useTheme } from "./theme-provider"
import { AboutDialog } from "./about-dialog"

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?"
}

export function UserFooter() {
  const { theme, setTheme } = useTheme()

  const [name, setName] = useState<string | null>(
    () => userSettingsStorage.get()?.name ?? null
  )
  const [nameDialogOpen, setNameDialogOpen] = useState(false)
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false)
  const [draftName, setDraftName] = useState("")

  function openNameDialog() {
    setDraftName(name ?? "")
    setNameDialogOpen(true)
  }

  function handleSaveName() {
    const trimmed = draftName.trim()
    if (!trimmed) return
    userSettingsStorage.set({ name: trimmed })
    setName(trimmed)
    setNameDialogOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        {/* Removed asChild here */}
        <DropdownMenuTrigger>
          {/* Swapped <button> to a <div> to avoid nested buttons in Base UI */}
          <div
            role="button"
            tabIndex={0}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md text-left text-sm select-none hover:bg-sidebar-accent"
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback>{getInitial(name ?? "?")}</AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate">{name ?? "Set your name"}</span>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top" align="start" className="w-56">
          <DropdownMenuItem onClick={openNameDialog}>
            <Pencil size={14} />
            Edit name
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Monitor size={14} />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={(value) =>
                    setTheme(value as "light" | "dark" | "system")
                  }
                >
                  <DropdownMenuRadioItem value="light">
                    <Sun size={14} />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <Moon size={14} />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <Monitor size={14} />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setAboutDialogOpen(true)}>
            <Info size={14} />
            About
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your name</DialogTitle>
          </DialogHeader>

          <Field>
            <FieldLabel htmlFor="user-name">
              Used as the author in exported schemas
            </FieldLabel>
            <Input
              id="user-name"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName()
              }}
              autoFocus
            />
          </Field>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveName} disabled={!draftName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AboutDialog open={aboutDialogOpen} onOpenChange={setAboutDialogOpen} />
    </>
  )
}
