export type ConversationStatusFilter = "active" | "archived"

export interface ConversationListParams {
  search?: string
  status?: ConversationStatusFilter
  skip?: number
  limit?: number
}

export interface ConversationListItem {
  id: string
  title: string
  status: ConversationStatusFilter | string
  message_count: number
  created_at: string
  updated_at: string
  last_message_at: string | null
  preview?: string | null
}

export interface ConversationListResponse {
  items: ConversationListItem[]
  total: number
  skip: number
  limit: number
}

export interface ConversationRailFilterState {
  searchDraft: string
  selectedStatus: ConversationStatusFilter
}

export interface ConversationSelectionState {
  activeConversationId: string | null
}

export interface ConversationRailResponsiveState {
  isRailSheetOpen: boolean
}
