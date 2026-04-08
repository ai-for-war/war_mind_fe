import { apiClient } from "@/lib/api-client"

import type {
  ConversationMessagesResponse,
  LeadAgentRuntimeCatalogResponse,
  SendMessageRequest,
  SendMessageResponse,
} from "@/features/super-agent/types"

const listConversationMessages = async (
  conversationId: string,
): Promise<ConversationMessagesResponse> => {
  const response = await apiClient.get<ConversationMessagesResponse>(
    `/lead-agent/conversations/${conversationId}/messages`,
  )

  return response.data
}

const getLeadAgentRuntimeCatalog = async (): Promise<LeadAgentRuntimeCatalogResponse> => {
  const response = await apiClient.get<LeadAgentRuntimeCatalogResponse>("/lead-agent/catalog")

  return response.data
}

const sendMessage = async (payload: SendMessageRequest): Promise<SendMessageResponse> => {
  const response = await apiClient.post<SendMessageResponse>("/lead-agent/messages", {
    content: payload.content.trim(),
    conversation_id: payload.conversation_id ?? null,
    model: payload.model,
    provider: payload.provider,
    reasoning: payload.reasoning,
    subagent_enabled: payload.subagent_enabled,
  })

  return response.data
}

export const messagesApi = {
  getLeadAgentRuntimeCatalog,
  listConversationMessages,
  sendMessage,
}
