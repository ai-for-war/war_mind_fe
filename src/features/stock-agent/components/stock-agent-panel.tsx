import { useEffect } from "react"
import { motion } from "motion/react"

import { Separator } from "@/components/ui/separator"
import { StockAgentChatWorkspace } from "@/features/stock-agent/components/chat-workspace"
import { StockAgentConversationRail } from "@/features/stock-agent/components/conversation-rail"
import { useStockAgentRailStore } from "@/features/stock-agent/stores/use-stock-agent-rail-store"
import { cn } from "@/lib/utils"

type StockAgentPanelProps = {
  className?: string
  isMobile?: boolean
}

export const StockAgentPanel = ({ className, isMobile = false }: StockAgentPanelProps) => {
  const isConversationRailOpen = useStockAgentRailStore(
    (state) => state.isConversationRailOpen,
  )
  const setPanelOpen = useStockAgentRailStore((state) => state.setPanelOpen)

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
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {!isMobile ? (
            <motion.div
              aria-hidden={!isConversationRailOpen}
              animate={{
                opacity: isConversationRailOpen ? 1 : 0,
                width: isConversationRailOpen ? 241 : 0,
              }}
              className="flex min-h-0 shrink-0 overflow-hidden"
              initial={false}
              transition={{ type: "tween", duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <StockAgentConversationRail className="w-[15rem] shrink-0" />
              <Separator orientation="vertical" />
            </motion.div>
          ) : null}
          <StockAgentChatWorkspace className="min-w-0 flex-1" isMobile={isMobile} />
        </div>
      </div>
    </section>
  )
}
