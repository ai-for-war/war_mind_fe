import type { SuperAgentRuntimeSnapshotPayload } from "@/features/super-agent/types/runtime-catalog.types"

export type SuperAgentMessageRole = "user" | "assistant" | "system" | "tool" | string

export interface SuperAgentMessageRuntimeMetadata {
  runtime?: SuperAgentRuntimeSnapshotPayload
}

export interface SuperAgentMessageRecord {
  id: string
  conversation_id: string
  role: SuperAgentMessageRole
  content: string
  attachments: unknown[] | null
  metadata: (Record<string, unknown> & SuperAgentMessageRuntimeMetadata) | null
  is_complete: boolean
  created_at: string
}

export interface ConversationMessagesResponse {
  conversation_id: string
  messages: SuperAgentMessageRecord[]
}

export interface SendMessageRequest {
  content: string
  conversation_id?: string | null
  provider: string
  model: string
  reasoning?: string
}

export interface SendMessageResponse {
  conversation_id: string
  user_message_id: string
}

export interface ChatMessageStartedPayload {
  conversation_id: string
  organization_id?: string
}

export interface ChatMessageTokenPayload {
  conversation_id: string
  token: string
  organization_id?: string
}

export interface ChatMessageToolStartPayload {
  arguments: Record<string, unknown>
  conversation_id: string
  organization_id?: string
  tool_call_id: string
  tool_name: string
}

export interface ChatMessageToolEndPayload {
  conversation_id: string
  organization_id?: string
  result: string
  tool_call_id: string
}

export interface ChatMessageCompletedPayload {
  content: string
  conversation_id: string
  message_id: string
  metadata: Record<string, unknown> | null
  organization_id?: string
}

export interface ChatMessageFailedPayload {
  conversation_id: string
  error: string
  organization_id?: string
}

export type SuperAgentSocketLifecyclePayload =
  | ChatMessageStartedPayload
  | ChatMessageTokenPayload
  | ChatMessageToolStartPayload
  | ChatMessageToolEndPayload
  | ChatMessageCompletedPayload
  | ChatMessageFailedPayload

export type SuperAgentRunStatus = "idle" | "submitting" | "streaming" | "completed" | "failed"

export type SuperAgentThreadRow =
  | {
      id: string
      kind: "message"
      message: SuperAgentMessageRecord
    }
  | {
      id: string
      kind: "streaming-assistant"
      content: string
      conversation_id: string
    }
  | {
      id: string
      kind: "error"
      conversation_id: string
      message: string
    }

export interface SuperAgentStreamingAssistantState {
  content: string
  isStreaming: boolean
  updatedAt: string
}
