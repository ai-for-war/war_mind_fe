import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { conversationsApi } from "@/features/super-agent/api/conversations-api"
import { superAgentQueryKeys } from "@/features/super-agent/query-keys"
import type {
  ConversationListItem,
  ConversationListParams,
  ConversationListResponse,
} from "@/features/super-agent/types/conversation.types"

const DEFAULT_SKIP = 0
const DEFAULT_LIMIT = 20

const normalizeParams = (params: ConversationListParams): Required<ConversationListParams> => ({
  limit: params.limit ?? DEFAULT_LIMIT,
  search: params.search ?? "",
  skip: params.skip ?? DEFAULT_SKIP,
  status: params.status ?? "active",
})

type ConversationListQueryResult = UseQueryResult<ConversationListResponse, Error>

type UseConversationsQueryResult = ConversationListQueryResult & {
  conversations: ConversationListItem[]
  isEmpty: boolean
}

export const useConversations = (
  params: ConversationListParams = {},
): UseConversationsQueryResult => {
  const normalizedParams = normalizeParams(params)

  const query = useQuery({
    queryFn: () => conversationsApi.listConversations(normalizedParams),
    queryKey: superAgentQueryKeys.conversationsList(normalizedParams),
  })

  const conversations = query.data?.items ?? []
  const isEmpty = !query.isPending && !query.isError && conversations.length === 0

  return {
    ...query,
    conversations,
    isEmpty,
  }
}
