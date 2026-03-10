import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { messagesApi } from "@/features/multi-agent/api/messages-api"
import { multiAgentQueryKeys } from "@/features/multi-agent/query-keys"
import type {
  ConversationMessagesResponse,
  MultiAgentMessageRecord,
} from "@/features/multi-agent/types/chat-workspace.types"

type ConversationMessagesQueryResult = UseQueryResult<ConversationMessagesResponse, Error>

type UseConversationMessagesQueryResult = ConversationMessagesQueryResult & {
  messages: MultiAgentMessageRecord[]
  isEmpty: boolean
}

export const useConversationMessages = (
  conversationId: string | null,
): UseConversationMessagesQueryResult => {
  const query = useQuery({
    enabled: typeof conversationId === "string" && conversationId.length > 0,
    queryFn: () => messagesApi.listConversationMessages(conversationId as string),
    queryKey:
      typeof conversationId === "string" && conversationId.length > 0
        ? multiAgentQueryKeys.conversationMessages(conversationId)
        : multiAgentQueryKeys.conversationMessagesPlaceholder,
  })

  const messages = query.data?.messages ?? []
  const isEmpty = !query.isPending && !query.isError && messages.length === 0

  return {
    ...query,
    isEmpty,
    messages,
  }
}
