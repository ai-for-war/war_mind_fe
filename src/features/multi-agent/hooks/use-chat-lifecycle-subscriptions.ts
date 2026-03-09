import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { multiAgentQueryKeys } from "@/features/multi-agent/query-keys"
import { useMultiAgentChatWorkspaceStore } from "@/features/multi-agent/stores/use-multi-agent-chat-workspace-store"
import { useSocketSubscription, useSocketTransportStore } from "@/features/socket"
import type {
  ChatMessageCompletedPayload,
  ChatMessageFailedPayload,
  ChatMessageStartedPayload,
  ChatMessageTokenPayload,
} from "@/features/multi-agent/types/chat-workspace.types"

type UseChatLifecycleSubscriptionsOptions = {
  activeConversationId: string | null
}

export const useChatLifecycleSubscriptions = ({
  activeConversationId,
}: UseChatLifecycleSubscriptionsOptions): void => {
  const appendStreamingAssistantToken = useMultiAgentChatWorkspaceStore(
    (state) => state.appendStreamingAssistantToken,
  )
  const clearStreamingAssistant = useMultiAgentChatWorkspaceStore(
    (state) => state.clearStreamingAssistant,
  )
  const setRunStatus = useMultiAgentChatWorkspaceStore((state) => state.setRunStatus)
  const setStreamingAssistant = useMultiAgentChatWorkspaceStore(
    (state) => state.setStreamingAssistant,
  )
  const setThreadError = useMultiAgentChatWorkspaceStore((state) => state.setThreadError)
  const status = useSocketTransportStore((state) => state.status)
  const lastConnectedAt = useSocketTransportStore((state) => state.lastConnectedAt)
  const queryClient = useQueryClient()
  const lastHandledConnectedAtRef = useRef<number | null>(null)

  useSocketSubscription<ChatMessageStartedPayload>(
    "chat:message:started",
    ({ conversation_id }) => {
      setRunStatus(conversation_id, "streaming")
      setThreadError(conversation_id, null)
      setStreamingAssistant(conversation_id, {
        content: "",
        isStreaming: true,
      })
    },
    { organizationScoped: true },
  )

  useSocketSubscription<ChatMessageTokenPayload>(
    "chat:message:token",
    ({ conversation_id, token }) => {
      setRunStatus(conversation_id, "streaming")
      appendStreamingAssistantToken(conversation_id, token)
    },
    { organizationScoped: true },
  )

  useSocketSubscription<ChatMessageCompletedPayload>(
    "chat:message:completed",
    ({ conversation_id }) => {
      setRunStatus(conversation_id, "completed")
      setThreadError(conversation_id, null)
      clearStreamingAssistant(conversation_id)

      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: multiAgentQueryKeys.conversationMessages(conversation_id),
        }),
        queryClient.invalidateQueries({
          queryKey: multiAgentQueryKeys.conversationsAll,
        }),
      ])
    },
    { organizationScoped: true },
  )

  useSocketSubscription<ChatMessageFailedPayload>(
    "chat:message:failed",
    ({ conversation_id, error }) => {
      setRunStatus(conversation_id, "failed")
      setThreadError(conversation_id, error || "Assistant response failed.")
      clearStreamingAssistant(conversation_id)

      void queryClient.invalidateQueries({
        queryKey: multiAgentQueryKeys.conversationMessages(conversation_id),
      })
    },
    { organizationScoped: true },
  )

  useEffect(() => {
    if (status !== "connected" || !activeConversationId || !lastConnectedAt) {
      return
    }

    if (lastHandledConnectedAtRef.current === lastConnectedAt) {
      return
    }

    lastHandledConnectedAtRef.current = lastConnectedAt

    void Promise.all([
      queryClient.invalidateQueries({
        queryKey: multiAgentQueryKeys.conversationMessages(activeConversationId),
      }),
      queryClient.invalidateQueries({
        queryKey: multiAgentQueryKeys.conversationsAll,
      }),
    ])
  }, [activeConversationId, lastConnectedAt, queryClient, status])
}
