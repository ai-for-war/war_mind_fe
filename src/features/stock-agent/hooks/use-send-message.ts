import { useMutation, useQueryClient } from "@tanstack/react-query"

import { stockAgentMessagesApi } from "@/features/stock-agent/api/messages-api"
import { stockAgentQueryKeys } from "@/features/stock-agent/query-keys"
import type {
  StockAgentConversationMessagesResponse,
  StockAgentMessageRecord,
  StockAgentSendMessageRequest,
} from "@/features/stock-agent/types/chat-workspace.types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type StockAgentSendMessageMutationContext = {
  conversationId: string | null
  previousMessages: StockAgentConversationMessagesResponse | undefined
}

export const useStockAgentSendMessage = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    onMutate: async (
      payload,
    ): Promise<StockAgentSendMessageMutationContext> => {
      const conversationId = payload.conversation_id ?? null
      if (!conversationId) {
        return { conversationId: null, previousMessages: undefined }
      }

      const queryKey = stockAgentQueryKeys.conversationMessages(
        activeOrganizationId,
        conversationId,
      )
      await queryClient.cancelQueries({ queryKey })

      const previousMessages =
        queryClient.getQueryData<StockAgentConversationMessagesResponse>(queryKey)
      const optimisticMessage: StockAgentMessageRecord = {
        attachments: null,
        content: payload.content.trim(),
        conversation_id: conversationId,
        created_at: new Date().toISOString(),
        id: `optimistic-user-${Date.now()}`,
        is_complete: true,
        metadata: { optimistic: true },
        role: "user",
      }

      queryClient.setQueryData<StockAgentConversationMessagesResponse>(queryKey, {
        conversation_id: conversationId,
        messages: [...(previousMessages?.messages ?? []), optimisticMessage],
      })

      return { conversationId, previousMessages }
    },
    mutationFn: (payload: StockAgentSendMessageRequest) =>
      stockAgentMessagesApi.sendMessage(payload),
    onError: (_error, _variables, context) => {
      if (!context?.conversationId) {
        return
      }

      queryClient.setQueryData(
        stockAgentQueryKeys.conversationMessages(
          activeOrganizationId,
          context.conversationId,
        ),
        context.previousMessages,
      )
    },
    onSuccess: async ({ conversation_id }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: stockAgentQueryKeys.conversationsAll(activeOrganizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: stockAgentQueryKeys.conversationMessages(
            activeOrganizationId,
            conversation_id,
          ),
        }),
      ])
    },
  })
}
