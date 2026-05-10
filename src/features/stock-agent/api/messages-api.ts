import { apiClient } from "@/lib/api-client"

import type {
  StockAgentConversationMessagesResponse,
  StockAgentRuntimeCatalogResponse,
  StockAgentSendMessageRequest,
  StockAgentSendMessageResponse,
} from "@/features/stock-agent/types"

const listConversationMessages = async (
  conversationId: string,
): Promise<StockAgentConversationMessagesResponse> => {
  const response = await apiClient.get<StockAgentConversationMessagesResponse>(
    `/stock-agent/conversations/${conversationId}/messages`,
  )

  return response.data
}

const getStockAgentRuntimeCatalog = async (): Promise<StockAgentRuntimeCatalogResponse> => {
  const response = await apiClient.get<StockAgentRuntimeCatalogResponse>("/stock-agent/catalog")

  return response.data
}

const sendMessage = async (
  payload: StockAgentSendMessageRequest,
): Promise<StockAgentSendMessageResponse> => {
  const response = await apiClient.post<StockAgentSendMessageResponse>("/stock-agent/messages", {
    content: payload.content.trim(),
    conversation_id: payload.conversation_id ?? null,
    model: payload.model,
    provider: payload.provider,
    reasoning: payload.reasoning,
    subagent_enabled: payload.subagent_enabled,
  })

  return response.data
}

export const stockAgentMessagesApi = {
  getStockAgentRuntimeCatalog,
  listConversationMessages,
  sendMessage,
}
