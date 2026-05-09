import { BrainCircuit } from "lucide-react"
import { useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { StockAgentPanel } from "@/features/stock-agent/components/stock-agent-panel"
import { useStockAgentChatWorkspaceStore } from "@/features/stock-agent/stores/use-stock-agent-chat-workspace-store"
import { useStockAgentRailStore } from "@/features/stock-agent/stores/use-stock-agent-rail-store"
import type { StockAgentRunStatus } from "@/features/stock-agent/types"
import { cn } from "@/lib/utils"

const MARKET_ROUTE_PREFIXES = ["/stocks", "/backtests"] as const

const isMarketRoute = (pathname: string): boolean =>
  MARKET_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )

const hasActiveRun = (statuses: Record<string, StockAgentRunStatus>): boolean =>
  Object.values(statuses).some((status) => status === "submitting" || status === "streaming")

export const StockAgentFloatingLauncher = () => {
  const location = useLocation()
  const isPanelOpen = useStockAgentRailStore((state) => state.isPanelOpen)
  const setPanelOpen = useStockAgentRailStore((state) => state.setPanelOpen)
  const runStatusByConversation = useStockAgentChatWorkspaceStore(
    (state) => state.runStatusByConversation,
  )
  const isRunning = hasActiveRun(runStatusByConversation)

  if (!isMarketRoute(location.pathname)) {
    return null
  }

  return (
    <>
      <div className="fixed right-6 bottom-6 z-30">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Open Stock Agent"
                className={cn(
                  "relative size-13 rounded-full border border-border/70 bg-background/90 shadow-xl backdrop-blur",
                  "hover:bg-accent active:scale-[0.98]",
                )}
                onClick={() => setPanelOpen(true)}
                size="icon"
                type="button"
                variant="outline"
              >
                <BrainCircuit className="size-5" />
                {isRunning && !isPanelOpen ? (
                  <span className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-primary ring-2 ring-background" />
                ) : null}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Stock Agent</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {isPanelOpen ? (
        <div className="fixed right-6 bottom-24 z-30 hidden md:flex">
          <StockAgentPanel />
        </div>
      ) : null}

      <Sheet onOpenChange={setPanelOpen} open={isPanelOpen}>
        <SheetContent
          className="h-full w-full max-w-none p-0 md:hidden"
          side="right"
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">Stock Agent</SheetTitle>
          <SheetDescription className="sr-only">
            Chat with the stock-specialized agent.
          </SheetDescription>
          <StockAgentPanel isMobile />
        </SheetContent>
      </Sheet>
    </>
  )
}
