import { SidebarTrigger } from "@/components/ui/sidebar"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"
import { HeaderNotificationInbox } from "@/widgets/header/components/header-notification-inbox"
import { HeaderUserNav } from "@/widgets/header/components/header-user-nav"

export const AppHeader = () => {
  const activeOrganizationId = useActiveOrganizationId()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <SidebarTrigger />
      <div className="flex-1" />
      <HeaderNotificationInbox key={activeOrganizationId ?? "__no_organization__"} />
      <HeaderUserNav />
    </header>
  )
}
