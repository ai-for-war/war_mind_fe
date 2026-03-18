
import warmindLogo from "@/assets/images/WARMIND.png"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "@/widgets/sidebar/components/nav-main"
import { OrgSwitcher } from "@/widgets/sidebar/components/org-switcher"

export const AppSidebar = () => {
  return (
    <Sidebar >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {/* <BrainCircuit className="size-4" /> */}
                <img src={warmindLogo} alt="WARMIND Logo" className="h-8 w-8 object-contain" />
                </div>
                {/* <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold">WARMIND</span>
                  <span className="">v1.0.0</span>
                </div> */}
                <h2 className="text-xl font-bold">WARMIND</h2>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <OrgSwitcher />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
