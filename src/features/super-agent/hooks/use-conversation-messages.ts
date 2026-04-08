import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { messagesApi } from "@/features/super-agent/api/messages-api"
import { superAgentQueryKeys } from "@/features/super-agent/query-keys"
import type {
  ConversationMessagesResponse,
  SuperAgentMessageRecord,
} from "@/features/super-agent/types/chat-workspace.types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type ConversationMessagesQueryResult = UseQueryResult<ConversationMessagesResponse, Error>

type UseConversationMessagesQueryResult = ConversationMessagesQueryResult & {
  messages: SuperAgentMessageRecord[]
  isEmpty: boolean
}

export const useConversationMessages = (
  conversationId: string | null,
): UseConversationMessagesQueryResult => {
  const activeOrganizationId = useActiveOrganizationId()
  const query = useQuery({
    enabled: typeof conversationId === "string" && conversationId.length > 0,
    queryFn: () => messagesApi.listConversationMessages(conversationId as string),
    queryKey:
      typeof conversationId === "string" && conversationId.length > 0
        ? superAgentQueryKeys.conversationMessages(
            activeOrganizationId,
            conversationId,
          )
        : superAgentQueryKeys.conversationMessagesPlaceholder(activeOrganizationId),
  })

  const messages = query.data?.messages ?? []
  const isEmpty = !query.isPending && !query.isError && messages.length === 0

  return {
    ...query,
    isEmpty,
    messages,
  }
}
