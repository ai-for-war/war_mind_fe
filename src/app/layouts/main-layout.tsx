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
      className="dark min-h-svh bg-neutral-950 text-foreground"
    >
      <AppSidebar />
      <SidebarInset className="bg-neutral-950">
        <AppHeader />
        <div className="flex-1 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
