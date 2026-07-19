import { useState } from "react"
import { Plus } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroupContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useProjectStore } from "@/store/projectStore"
import { ProjectList } from "./project-list"
import { ProjectNameDialog } from "./project-name-dialog"
import { UserFooter } from "./user-footer"

export function AppSidebar() {
  const createProject = useProjectStore((s) => s.createProject)
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex-row items-center justify-between">
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupAction
            title="New project"
            onClick={() => setNewProjectDialogOpen(true)}
          >
            <Plus size={16} />
          </SidebarGroupAction>

          <SidebarGroupContent>
            <ProjectList />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserFooter />
      </SidebarFooter>

      <ProjectNameDialog
        open={newProjectDialogOpen}
        onOpenChange={setNewProjectDialogOpen}
        mode="create"
        onSubmit={(name) => createProject(name)}
      />
    </Sidebar>
  )
}
