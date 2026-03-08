import { useMutation, useQueryClient } from "@tanstack/react-query"

import { messagesApi } from "@/features/multi-agent/api/messages-api"
import { multiAgentQueryKeys } from "@/features/multi-agent/query-keys"
import type { SendMessageRequest } from "@/features/multi-agent/types/chat-workspace.types"

export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SendMessageRequest) => messagesApi.sendMessage(payload),
    onSuccess: async ({ conversation_id }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: multiAgentQueryKeys.conversationsAll,
        }),
        queryClient.invalidateQueries({
          queryKey: multiAgentQueryKeys.conversationMessages(conversation_id),
        }),
      ])
    },
  })
}
