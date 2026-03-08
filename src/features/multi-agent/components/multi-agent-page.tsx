import { ConversationRail } from "@/features/multi-agent/components/conversation-rail"
import { useMultiAgentRailStore } from "@/features/multi-agent/stores/use-multi-agent-rail-store"

export const MultiAgentPage = () => {
  const activeConversationId = useMultiAgentRailStore((state) => state.activeConversationId)

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Multi-Agent</h1>
        <p className="text-sm text-muted-foreground">
          Use the conversation rail to switch context or start a new chat.
        </p>
      </header>

      <div className="flex min-h-[calc(100vh-12rem)] flex-col gap-4 lg:flex-row">
        <ConversationRail />
        <div className="flex min-h-[24rem] flex-1 items-center justify-center rounded-xl border border-dashed bg-muted/20 p-6">
          <p className="text-sm text-muted-foreground">
            {activeConversationId
              ? `Active conversation: ${activeConversationId}`
              : "Select a conversation or click New chat to begin."}
          </p>
        </div>
      </div>
    </section>
  )
}
