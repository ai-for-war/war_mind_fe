import { useMutation, useQueryClient } from "@tanstack/react-query"

import { messagesApi } from "@/features/super-agent/api/messages-api"
import { superAgentQueryKeys } from "@/features/super-agent/query-keys"
import type {
  ConversationMessagesResponse,
  SuperAgentMessageRecord,
  SendMessageRequest,
} from "@/features/super-agent/types/chat-workspace.types"

type SendMessageMutationContext = {
  conversationId: string | null
  previousMessages: ConversationMessagesResponse | undefined
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    onMutate: async (payload): Promise<SendMessageMutationContext> => {
      const conversationId = payload.conversation_id ?? null
      if (!conversationId) {
        return { conversationId: null, previousMessages: undefined }
      }

      const queryKey = superAgentQueryKeys.conversationMessages(conversationId)
      await queryClient.cancelQueries({ queryKey })

      const previousMessages = queryClient.getQueryData<ConversationMessagesResponse>(queryKey)
      const optimisticMessage: SuperAgentMessageRecord = {
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
        superAgentQueryKeys.conversationMessages(context.conversationId),
        context.previousMessages,
      )
    },
    onSuccess: async ({ conversation_id }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: superAgentQueryKeys.conversationsAll,
        }),
        queryClient.invalidateQueries({
          queryKey: superAgentQueryKeys.conversationMessages(conversation_id),
        }),
      ])
    },
  })
}
