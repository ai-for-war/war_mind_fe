import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { superAgentQueryKeys } from "@/features/super-agent/query-keys"
import { useSuperAgentChatWorkspaceStore } from "@/features/super-agent/stores/use-super-agent-chat-workspace-store"
import { useSocketSubscription, useSocketTransportStore } from "@/features/socket"
import type {
  ChatMessageCompletedPayload,
  ChatMessageFailedPayload,
  ChatMessagePlanUpdatedPayload,
  ChatMessageStartedPayload,
  ChatMessageTokenPayload,
  ChatMessageToolEndPayload,
  ChatMessageToolStartPayload,
} from "@/features/super-agent/types/chat-workspace.types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseChatLifecycleSubscriptionsOptions = {
  activeConversationId: string | null
}

export const useChatLifecycleSubscriptions = ({
  activeConversationId,
}: UseChatLifecycleSubscriptionsOptions): void => {
  const activeOrganizationId = useActiveOrganizationId()
  const appendStreamingAssistantToken = useSuperAgentChatWorkspaceStore(
    (state) => state.appendStreamingAssistantToken,
  )
  const clearActivityTrace = useSuperAgentChatWorkspaceStore((state) => state.clearActivityTrace)
  const clearStreamingAssistant = useSuperAgentChatWorkspaceStore(
    (state) => state.clearStreamingAssistant,
  )
  const setInlineActivityStepStatus = useSuperAgentChatWorkspaceStore(
    (state) => state.setInlineActivityStepStatus,
  )
  const setInlineActivityTraceStatus = useSuperAgentChatWorkspaceStore(
    (state) => state.setInlineActivityTraceStatus,
  )
  const setRunStatus = useSuperAgentChatWorkspaceStore((state) => state.setRunStatus)
  const setPlan = useSuperAgentChatWorkspaceStore((state) => state.setPlan)
  const setStreamingAssistant = useSuperAgentChatWorkspaceStore(
    (state) => state.setStreamingAssistant,
  )
  const setThreadError = useSuperAgentChatWorkspaceStore((state) => state.setThreadError)
  const upsertInlineActivityStep = useSuperAgentChatWorkspaceStore(
    (state) => state.upsertInlineActivityStep,
  )
  const status = useSocketTransportStore((state) => state.status)
  const lastConnectedAt = useSocketTransportStore((state) => state.lastConnectedAt)
  const queryClient = useQueryClient()
  const lastHandledConnectedAtRef = useRef<number | null>(null)

  useSocketSubscription<ChatMessageStartedPayload>(
    "chat:message:started",
    ({ conversation_id }) => {
      clearActivityTrace(conversation_id)
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

  useSocketSubscription<ChatMessagePlanUpdatedPayload>(
    "chat:message:plan_updated",
    ({ conversation_id, summary, todos }) => {
      setPlan(conversation_id, {
        summary,
        todos,
      })
    },
    { organizationScoped: true },
  )

  useSocketSubscription<ChatMessageToolStartPayload>(
    "chat:message:tool_start",
    ({ arguments: toolArguments, conversation_id, tool_call_id, tool_name }) => {
      setRunStatus(conversation_id, "streaming")
      setInlineActivityTraceStatus(conversation_id, "streaming")
      upsertInlineActivityStep(conversation_id, {
        arguments: toolArguments,
        status: "active",
        toolCallId: tool_call_id,
        toolName: tool_name,
      })
    },
    { organizationScoped: true },
  )

  useSocketSubscription<ChatMessageToolEndPayload>(
    "chat:message:tool_end",
    ({ conversation_id, result, tool_call_id }) => {
      setInlineActivityStepStatus(conversation_id, tool_call_id, "complete", result)
    },
    { organizationScoped: true },
  )

  useSocketSubscription<ChatMessageCompletedPayload>(
    "chat:message:completed",
    ({ conversation_id }) => {
      setRunStatus(conversation_id, "completed")
      setInlineActivityTraceStatus(conversation_id, "completed")
      setThreadError(conversation_id, null)
      clearStreamingAssistant(conversation_id)

      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: superAgentQueryKeys.conversationMessages(
            activeOrganizationId,
            conversation_id,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: superAgentQueryKeys.conversationsAll(activeOrganizationId),
        }),
      ])
    },
    { organizationScoped: true },
  )

  useSocketSubscription<ChatMessageFailedPayload>(
    "chat:message:failed",
    ({ conversation_id, error }) => {
      const activityTrace =
        useSuperAgentChatWorkspaceStore.getState().activityTraceByConversation[conversation_id]
      const latestActiveStep = [...(activityTrace?.steps ?? [])]
        .reverse()
        .find((step) => step.status === "active")

      setRunStatus(conversation_id, "failed")
      setInlineActivityTraceStatus(conversation_id, "failed")
      if (latestActiveStep) {
        setInlineActivityStepStatus(conversation_id, latestActiveStep.toolCallId, "failed")
      }
      setThreadError(conversation_id, error || "Assistant response failed.")
      clearStreamingAssistant(conversation_id)

      void queryClient.invalidateQueries({
        queryKey: superAgentQueryKeys.conversationMessages(
          activeOrganizationId,
          conversation_id,
        ),
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
        queryKey: superAgentQueryKeys.conversationMessages(
          activeOrganizationId,
          activeConversationId,
        ),
      }),
      queryClient.invalidateQueries({
        queryKey: superAgentQueryKeys.conversationsAll(activeOrganizationId),
      }),
    ])
  }, [activeConversationId, activeOrganizationId, lastConnectedAt, queryClient, status])
}
