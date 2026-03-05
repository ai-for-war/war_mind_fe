import { BrainCircuit } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "@/widgets/sidebar/components/nav-main"

export const AppSidebar = () => {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 overflow-hidden rounded-md px-2 py-1.5">
          <BrainCircuit className="size-4 shrink-0" />
          <span className="truncate font-semibold group-data-[collapsible=icon]:hidden">
            WAR MIND
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  )
}
