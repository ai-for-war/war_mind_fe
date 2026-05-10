import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { stockAgentQueryKeys } from "@/features/stock-agent/query-keys"
import { useStockAgentChatWorkspaceStore } from "@/features/stock-agent/stores/use-stock-agent-chat-workspace-store"
import type {
  StockAgentChatMessageCompletedPayload,
  StockAgentChatMessageFailedPayload,
  StockAgentChatMessagePlanUpdatedPayload,
  StockAgentChatMessageStartedPayload,
  StockAgentChatMessageTokenPayload,
  StockAgentChatMessageToolEndPayload,
  StockAgentChatMessageToolStartPayload,
} from "@/features/stock-agent/types/chat-workspace.types"
import { formatStockAgentActivityLabel } from "@/features/stock-agent/utils/activity-line"
import { useSocketSubscription, useSocketTransportStore } from "@/features/socket"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseStockAgentChatLifecycleSubscriptionsOptions = {
  activeConversationId: string | null
}

const resolveErrorMessage = (error: string | null | undefined): string =>
  error && error.trim().length > 0 ? error : "Stock Agent response failed."

export const useStockAgentChatLifecycleSubscriptions = ({
  activeConversationId,
}: UseStockAgentChatLifecycleSubscriptionsOptions): void => {
  const activeOrganizationId = useActiveOrganizationId()
  const appendStreamingAssistantToken = useStockAgentChatWorkspaceStore(
    (state) => state.appendStreamingAssistantToken,
  )
  const clearActivityLine = useStockAgentChatWorkspaceStore((state) => state.clearActivityLine)
  const clearStreamingAssistant = useStockAgentChatWorkspaceStore(
    (state) => state.clearStreamingAssistant,
  )
  const recordActivityLineAction = useStockAgentChatWorkspaceStore(
    (state) => state.recordActivityLineAction,
  )
  const setActivityLineStatus = useStockAgentChatWorkspaceStore(
    (state) => state.setActivityLineStatus,
  )
  const setPlan = useStockAgentChatWorkspaceStore((state) => state.setPlan)
  const setRunStatus = useStockAgentChatWorkspaceStore((state) => state.setRunStatus)
  const setStreamingAssistant = useStockAgentChatWorkspaceStore(
    (state) => state.setStreamingAssistant,
  )
  const setThreadError = useStockAgentChatWorkspaceStore((state) => state.setThreadError)
  const touchActivityLineToolEnd = useStockAgentChatWorkspaceStore(
    (state) => state.touchActivityLineToolEnd,
  )
  const status = useSocketTransportStore((state) => state.status)
  const lastConnectedAt = useSocketTransportStore((state) => state.lastConnectedAt)
  const queryClient = useQueryClient()
  const lastHandledConnectedAtRef = useRef<number | null>(null)

  const isActiveConversationEvent = (conversationId: string): boolean =>
    Boolean(activeConversationId && activeConversationId === conversationId)

  useSocketSubscription<StockAgentChatMessageStartedPayload>(
    "chat:message:started",
    ({ conversation_id }) => {
      if (!isActiveConversationEvent(conversation_id)) {
        return
      }

      clearActivityLine(conversation_id)
      setRunStatus(conversation_id, "streaming")
      setThreadError(conversation_id, null)
      setStreamingAssistant(conversation_id, {
        content: "",
        isStreaming: true,
      })
    },
    { organizationScoped: true },
  )

  useSocketSubscription<StockAgentChatMessageTokenPayload>(
    "chat:message:token",
    ({ conversation_id, token }) => {
      if (!isActiveConversationEvent(conversation_id)) {
        return
      }

      setRunStatus(conversation_id, "streaming")
      appendStreamingAssistantToken(conversation_id, token)
    },
    { organizationScoped: true },
  )

  useSocketSubscription<StockAgentChatMessagePlanUpdatedPayload>(
    "chat:message:plan_updated",
    ({ conversation_id, summary, todos }) => {
      if (!isActiveConversationEvent(conversation_id)) {
        return
      }

      setPlan(conversation_id, {
        summary,
        todos,
      })
    },
    { organizationScoped: true },
  )

  useSocketSubscription<StockAgentChatMessageToolStartPayload>(
    "chat:message:tool_start",
    ({ arguments: toolArguments, conversation_id, tool_call_id, tool_name }) => {
      if (!isActiveConversationEvent(conversation_id)) {
        return
      }

      setRunStatus(conversation_id, "streaming")
      recordActivityLineAction(conversation_id, {
        arguments: toolArguments,
        label: formatStockAgentActivityLabel(tool_name),
        toolCallId: tool_call_id,
        toolName: tool_name,
      })
    },
    { organizationScoped: true },
  )

  useSocketSubscription<StockAgentChatMessageToolEndPayload>(
    "chat:message:tool_end",
    ({ conversation_id, result, tool_call_id }) => {
      if (!isActiveConversationEvent(conversation_id)) {
        return
      }

      touchActivityLineToolEnd(conversation_id, tool_call_id, result)
    },
    { organizationScoped: true },
  )

  useSocketSubscription<StockAgentChatMessageCompletedPayload>(
    "chat:message:completed",
    ({ conversation_id }) => {
      if (!isActiveConversationEvent(conversation_id)) {
        return
      }

      const activityLine =
        useStockAgentChatWorkspaceStore.getState().activityLineByConversation[conversation_id]

      setRunStatus(conversation_id, "completed")
      setActivityLineStatus(
        conversation_id,
        "completed",
        activityLine ? `Completed ${activityLine.actionCount} steps` : undefined,
      )
      setThreadError(conversation_id, null)
      clearStreamingAssistant(conversation_id)

      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: stockAgentQueryKeys.conversationMessages(
            activeOrganizationId,
            conversation_id,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: stockAgentQueryKeys.conversationsAll(activeOrganizationId),
        }),
      ])
    },
    { organizationScoped: true },
  )

  useSocketSubscription<StockAgentChatMessageFailedPayload>(
    "chat:message:failed",
    ({ conversation_id, error }) => {
      if (!isActiveConversationEvent(conversation_id)) {
        return
      }

      const errorMessage = resolveErrorMessage(error)
      const activityLine =
        useStockAgentChatWorkspaceStore.getState().activityLineByConversation[conversation_id]

      setRunStatus(conversation_id, "failed")
      if (activityLine) {
        setActivityLineStatus(
          conversation_id,
          "failed",
          `Stopped at step ${activityLine.actionCount}`,
        )
      }
      setThreadError(conversation_id, errorMessage)
      clearStreamingAssistant(conversation_id)
      toast.error(errorMessage)

      void queryClient.invalidateQueries({
        queryKey: stockAgentQueryKeys.conversationMessages(
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
        queryKey: stockAgentQueryKeys.conversationMessages(
          activeOrganizationId,
          activeConversationId,
        ),
      }),
      queryClient.invalidateQueries({
        queryKey: stockAgentQueryKeys.conversationsAll(activeOrganizationId),
      }),
    ])
  }, [activeConversationId, activeOrganizationId, lastConnectedAt, queryClient, status])
}
