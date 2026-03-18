import { Outlet } from "react-router-dom"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAppStore } from "@/stores/use-app-store"
import { AppHeader } from "@/widgets/header"
import { AppSidebar } from "@/widgets/sidebar"

export const MainLayout = () => {
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)

  return (
    <SidebarProvider
      open={isSidebarOpen}
      onOpenChange={setSidebarOpen}
      className="min-h-svh bg-background text-foreground"
    >
      <AppSidebar />
      <SidebarInset className="min-h-svh overflow-hidden bg-background">
        <AppHeader />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
