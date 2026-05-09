import { X } from "lucide-react"
import { useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { StockAgentChatWorkspace } from "@/features/stock-agent/components/chat-workspace"
import { StockAgentConversationRail } from "@/features/stock-agent/components/conversation-rail"
import { useStockAgentChatWorkspaceStore } from "@/features/stock-agent/stores/use-stock-agent-chat-workspace-store"
import { useStockAgentRailStore } from "@/features/stock-agent/stores/use-stock-agent-rail-store"
import type { StockAgentRunStatus } from "@/features/stock-agent/types"
import { cn } from "@/lib/utils"

type StockAgentPanelProps = {
  className?: string
  isMobile?: boolean
}

const resolvePanelStatus = (
  statuses: Record<string, StockAgentRunStatus>,
): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
  const values = Object.values(statuses)

  if (values.includes("failed")) {
    return { label: "Failed", variant: "destructive" }
  }

  if (values.includes("streaming")) {
    return { label: "Streaming", variant: "default" }
  }

  if (values.includes("submitting")) {
    return { label: "Thinking", variant: "default" }
  }

  return { label: "Idle", variant: "secondary" }
}

export const StockAgentPanel = ({ className, isMobile = false }: StockAgentPanelProps) => {
  const setPanelOpen = useStockAgentRailStore((state) => state.setPanelOpen)
  const runStatusByConversation = useStockAgentChatWorkspaceStore(
    (state) => state.runStatusByConversation,
  )
  const panelStatus = resolvePanelStatus(runStatusByConversation)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanelOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setPanelOpen])

  return (
    <section
      aria-label="Stock Agent chat"
      className={cn(
        "flex min-h-0 min-w-0 overflow-hidden border bg-background/92 text-foreground shadow-2xl backdrop-blur-xl",
        isMobile
          ? "h-full w-full flex-col rounded-none"
          : "h-[min(760px,calc(100dvh-6.5rem))] w-[min(880px,calc(100vw-3rem))] rounded-xl",
        className,
      )}
    >
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">Stock Agent</h2>
            <p className="truncate text-xs text-muted-foreground">Market conversation workspace</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={panelStatus.variant}>{panelStatus.label}</Badge>
            <Button
              aria-label="Minimize Stock Agent"
              onClick={() => setPanelOpen(false)}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {!isMobile ? (
            <>
              <StockAgentConversationRail className="w-[15rem] shrink-0" />
              <Separator orientation="vertical" />
            </>
          ) : null}
          <StockAgentChatWorkspace className="min-w-0 flex-1" isMobile={isMobile} />
        </div>
      </div>
    </section>
  )
}
