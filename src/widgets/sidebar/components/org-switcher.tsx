import { Check, ChevronsUpDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useOrganizationStore } from "@/stores/use-organization-store"

export const OrgSwitcher = () => {
  const organizations = useOrganizationStore((state) => state.organizations)
  const activeOrganization = useOrganizationStore(
    (state) => state.activeOrganization,
  )
  const setActiveOrganization = useOrganizationStore(
    (state) => state.setActiveOrganization,
  )

  if (!activeOrganization) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {/* <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {getOrgInitials(activeOrganization.organization.name)}
              </div> */}
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">
                  {activeOrganization.organization.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeOrganization.role}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) rounded-lg"
          >
            <DropdownMenuLabel className="font-semibold text-primary border-b">Organizations</DropdownMenuLabel>
            {organizations.map((org) => {
              const orgId = org.organization.id
              const isSelected = orgId === activeOrganization.organization.id

              return (
                <DropdownMenuItem
                  key={orgId}
                  onSelect={() => setActiveOrganization(orgId)}
                >
                  {/* <div className="flex size-6 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
                    {getOrgInitials(org.organization.name)}
                  </div> */}
                  <span className="truncate">{org.organization.name}</span>
                  {isSelected ? <Check className="ml-auto size-4" /> : null}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
