import { apiClient } from "@/lib/api-client"

import type {
  StockAgentConversationListParams,
  StockAgentConversationListResponse,
} from "@/features/stock-agent/types/conversation.types"

const DEFAULT_SKIP = 0
const DEFAULT_LIMIT = 20

const listConversations = async (
  params: StockAgentConversationListParams = {},
): Promise<StockAgentConversationListResponse> => {
  const response = await apiClient.get<StockAgentConversationListResponse>(
    "/stock-agent/conversations",
    {
      params: {
        limit: params.limit ?? DEFAULT_LIMIT,
        search: params.search?.trim() || undefined,
        skip: params.skip ?? DEFAULT_SKIP,
        status: params.status,
      },
    },
  )

  return response.data
}

export const stockAgentConversationsApi = {
  listConversations,
}
