// import { PanelLeft } from "lucide-react"

// import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { ChatWorkspace } from "@/features/super-agent/components/chat-workspace"
import { ConversationRail } from "@/features/super-agent/components/conversation-rail"
import { useSuperAgentRailStore } from "@/features/super-agent/stores/use-super-agent-rail-store"

export const SuperAgentPage = () => {
  const isRailSheetOpen = useSuperAgentRailStore((state) => state.isRailSheetOpen)
  const setRailSheetOpen = useSuperAgentRailStore((state) => state.setRailSheetOpen)

  return (
    <section className="space-y-6">
      {/* <header className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Super-Agent</h1>
          <p className="text-sm text-muted-foreground">
            Use the conversation rail to switch context or start a new chat.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setRailSheetOpen(true)}
        >
          <PanelLeft className="size-4" />
          Conversations
        </Button>
      </header> */}

      <div className="flex min-h-[calc(100vh-12rem)] flex-col gap-4 lg:flex-row">
        <ConversationRail className="hidden lg:flex" />

        <Sheet open={isRailSheetOpen} onOpenChange={setRailSheetOpen}>
          <SheetContent side="left" className="w-full max-w-[22rem] p-2 sm:max-w-[22rem]">
            <SheetTitle className="sr-only">Conversation rail</SheetTitle>
            <SheetDescription className="sr-only">
              Browse and switch super-agent conversations.
            </SheetDescription>
            <ConversationRail
              className="min-h-0 rounded-md border-0"
              onConversationSelected={() => setRailSheetOpen(false)}
              onNewChat={() => setRailSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <ChatWorkspace />
      </div>
    </section>
  )
}
