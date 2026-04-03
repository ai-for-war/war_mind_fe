import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { messagesApi } from "@/features/super-agent/api/messages-api"
import { superAgentQueryKeys } from "@/features/super-agent/query-keys"
import type {
  ConversationMessagesResponse,
  SuperAgentMessageRecord,
} from "@/features/super-agent/types/chat-workspace.types"

type ConversationMessagesQueryResult = UseQueryResult<ConversationMessagesResponse, Error>

type UseConversationMessagesQueryResult = ConversationMessagesQueryResult & {
  messages: SuperAgentMessageRecord[]
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
        ? superAgentQueryKeys.conversationMessages(conversationId)
        : superAgentQueryKeys.conversationMessagesPlaceholder,
  })

  const messages = query.data?.messages ?? []
  const isEmpty = !query.isPending && !query.isError && messages.length === 0

  return {
    ...query,
    isEmpty,
    messages,
  }
}
