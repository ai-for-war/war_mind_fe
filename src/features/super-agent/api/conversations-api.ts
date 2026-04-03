import { apiClient } from "@/lib/api-client"

import type {
  ConversationListParams,
  ConversationListResponse,
} from "@/features/super-agent/types/conversation.types"

const DEFAULT_SKIP = 0
const DEFAULT_LIMIT = 20

const listConversations = async (
  params: ConversationListParams = {},
): Promise<ConversationListResponse> => {
  const response = await apiClient.get<ConversationListResponse>("/lead-agent/conversations", {
    params: {
      limit: params.limit ?? DEFAULT_LIMIT,
      search: params.search?.trim() || undefined,
      skip: params.skip ?? DEFAULT_SKIP,
      status: params.status,
    },
  })

  return response.data
}

export const conversationsApi = {
  listConversations,
}
