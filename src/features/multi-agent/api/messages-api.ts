import { apiClient } from "@/lib/api-client"

import type {
  ConversationMessagesResponse,
  SendMessageRequest,
  SendMessageResponse,
} from "@/features/multi-agent/types/chat-workspace.types"

const listConversationMessages = async (
  conversationId: string,
): Promise<ConversationMessagesResponse> => {
  const response = await apiClient.get<ConversationMessagesResponse>(
    `/chat/conversations/${conversationId}/messages`,
  )

  return response.data
}

const sendMessage = async (payload: SendMessageRequest): Promise<SendMessageResponse> => {
  const response = await apiClient.post<SendMessageResponse>("/chat/messages", {
    content: payload.content.trim(),
    conversation_id: payload.conversation_id ?? null,
  })

  return response.data
}

export const messagesApi = {
  listConversationMessages,
  sendMessage,
}
