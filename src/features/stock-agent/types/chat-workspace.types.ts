import type { StockAgentRuntimeSnapshotPayload } from "@/features/stock-agent/types/runtime-catalog.types"

export type StockAgentMessageRole = "user" | "assistant" | "system" | "tool" | string

export interface StockAgentMessageRuntimeMetadata {
  runtime?: StockAgentRuntimeSnapshotPayload
}

export interface StockAgentMessageRecord {
  id: string
  conversation_id: string
  role: StockAgentMessageRole
  content: string
  attachments: unknown[] | null
  metadata: (Record<string, unknown> & StockAgentMessageRuntimeMetadata) | null
  is_complete: boolean
  created_at: string
}

export interface StockAgentConversationMessagesResponse {
  conversation_id: string
  messages: StockAgentMessageRecord[]
}

export interface StockAgentSendMessageRequest {
  content: string
  conversation_id?: string | null
  provider: string
  model: string
  reasoning?: string
  subagent_enabled: boolean
}

export interface StockAgentSendMessageResponse {
  conversation_id: string
  user_message_id: string
}

export interface StockAgentChatMessageStartedPayload {
  conversation_id: string
  organization_id?: string
}

export interface StockAgentChatMessageTokenPayload {
  conversation_id: string
  token: string
  organization_id?: string
}

export interface StockAgentChatMessageToolStartPayload {
  arguments: Record<string, unknown>
  conversation_id: string
  organization_id?: string
  tool_call_id: string
  tool_name: string
}

export interface StockAgentChatMessageToolEndPayload {
  conversation_id: string
  organization_id?: string
  result: string
  tool_call_id: string
}

export interface StockAgentChatMessageCompletedPayload {
  content: string
  conversation_id: string
  message_id: string
  metadata: Record<string, unknown> | null
  organization_id?: string
}

export interface StockAgentChatMessageFailedPayload {
  conversation_id: string
  error: string
  organization_id?: string
}

export type StockAgentSocketLifecyclePayload =
  | StockAgentChatMessageStartedPayload
  | StockAgentChatMessageTokenPayload
  | StockAgentChatMessageToolStartPayload
  | StockAgentChatMessageToolEndPayload
  | StockAgentChatMessageCompletedPayload
  | StockAgentChatMessageFailedPayload

export type StockAgentRunStatus = "idle" | "submitting" | "streaming" | "completed" | "failed"

export type StockAgentActivityLineStatus = "streaming" | "completed" | "failed"

export interface StockAgentActivityLineState {
  actionCount: number
  completedAt: string | null
  latestAction: string
  latestToolCallId: string | null
  latestToolName: string | null
  startedAt: string
  status: StockAgentActivityLineStatus
  updatedAt: string
}

export interface StockAgentThreadRowMessage {
  id: string
  kind: "message"
  message: StockAgentMessageRecord
}

export interface StockAgentThreadRowStreamingAssistant {
  id: string
  kind: "streaming-assistant"
  content: string
  conversation_id: string
}

export interface StockAgentThreadRowError {
  id: string
  kind: "error"
  conversation_id: string
  message: string
}

export type StockAgentThreadRow =
  | StockAgentThreadRowMessage
  | StockAgentThreadRowStreamingAssistant
  | StockAgentThreadRowError

export interface StockAgentStreamingAssistantState {
  content: string
  isStreaming: boolean
  updatedAt: string
}
