import { useEffect, useRef } from "react"
import { Outlet } from "react-router-dom"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useInterviewSessionStore } from "@/features/interview-lab/stores"
import { useMeetingSessionStore } from "@/features/meeting-recorder/stores"
import { useMultiAgentChatWorkspaceStore } from "@/features/multi-agent/stores"
import { useMultiAgentRailStore } from "@/features/multi-agent/stores/use-multi-agent-rail-store"
import { useSuperAgentChatWorkspaceStore } from "@/features/super-agent/stores"
import { useSuperAgentRailStore } from "@/features/super-agent/stores/use-super-agent-rail-store"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"
import { useAppStore } from "@/stores/use-app-store"
import { AppHeader } from "@/widgets/header"
import { AppSidebar } from "@/widgets/sidebar"

export const MainLayout = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const previousOrganizationIdRef = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    if (previousOrganizationIdRef.current === undefined) {
      previousOrganizationIdRef.current = activeOrganizationId
      return
    }

    if (previousOrganizationIdRef.current === activeOrganizationId) {
      return
    }

    previousOrganizationIdRef.current = activeOrganizationId
    useMultiAgentRailStore.getState().resetRailState()
    useMultiAgentChatWorkspaceStore.getState().resetWorkspaceState()
    useSuperAgentRailStore.getState().resetRailState()
    useSuperAgentChatWorkspaceStore.getState().resetWorkspaceState()
    useMeetingSessionStore.getState().resetSession()
    useInterviewSessionStore.getState().resetSession()
  }, [activeOrganizationId])

  const organizationScopeKey = activeOrganizationId ?? "__no_organization__"

  return (
    <SidebarProvider
      open={isSidebarOpen}
      onOpenChange={setSidebarOpen}
      className="min-h-svh bg-background text-foreground"
    >
      <AppSidebar />
      <SidebarInset className="min-h-svh overflow-hidden bg-background">
        <AppHeader />
        <div
          key={organizationScopeKey}
          className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-6"
        >
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
