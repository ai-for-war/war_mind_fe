import { useMutation, useQueryClient } from "@tanstack/react-query"

import { messagesApi } from "@/features/multi-agent/api/messages-api"
import { multiAgentQueryKeys } from "@/features/multi-agent/query-keys"
import type {
  ConversationMessagesResponse,
  MultiAgentMessageRecord,
  SendMessageRequest,
} from "@/features/multi-agent/types/chat-workspace.types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type SendMessageMutationContext = {
  conversationId: string | null
  previousMessages: ConversationMessagesResponse | undefined
}

export const useSendMessage = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    onMutate: async (payload): Promise<SendMessageMutationContext> => {
      const conversationId = payload.conversation_id ?? null
      if (!conversationId) {
        return { conversationId: null, previousMessages: undefined }
      }

      const queryKey = multiAgentQueryKeys.conversationMessages(
        activeOrganizationId,
        conversationId,
      )
      await queryClient.cancelQueries({ queryKey })

      const previousMessages = queryClient.getQueryData<ConversationMessagesResponse>(queryKey)
      const optimisticMessage: MultiAgentMessageRecord = {
        attachments: null,
        content: payload.content.trim(),
        conversation_id: conversationId,
        created_at: new Date().toISOString(),
        id: `optimistic-user-${Date.now()}`,
        is_complete: true,
        metadata: { optimistic: true },
        role: "user",
      }

      queryClient.setQueryData<ConversationMessagesResponse>(queryKey, {
        conversation_id: conversationId,
        messages: [...(previousMessages?.messages ?? []), optimisticMessage],
      })

      return { conversationId, previousMessages }
    },
    mutationFn: (payload: SendMessageRequest) => messagesApi.sendMessage(payload),
    onError: (_error, _variables, context) => {
      if (!context?.conversationId) {
        return
      }

      queryClient.setQueryData(
        multiAgentQueryKeys.conversationMessages(
          activeOrganizationId,
          context.conversationId,
        ),
        context.previousMessages,
      )
    },
    onSuccess: async ({ conversation_id }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: multiAgentQueryKeys.conversationsAll(activeOrganizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: multiAgentQueryKeys.conversationMessages(
            activeOrganizationId,
            conversation_id,
          ),
        }),
      ])
    },
  })
}
