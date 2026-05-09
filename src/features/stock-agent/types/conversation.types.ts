export type StockAgentConversationStatusFilter = "active" | "archived"

export interface StockAgentConversationListParams {
  search?: string
  status?: StockAgentConversationStatusFilter
  skip?: number
  limit?: number
}

export interface StockAgentConversationListItem {
  id: string
  title: string
  status: StockAgentConversationStatusFilter | string
  message_count: number
  created_at: string
  updated_at: string
  last_message_at: string | null
  preview?: string | null
}

export interface StockAgentConversationListResponse {
  items: StockAgentConversationListItem[]
  total: number
  skip: number
  limit: number
}

export interface StockAgentConversationRailState {
  activeConversationId: string | null
  isConversationRailOpen: boolean
  isPanelOpen: boolean
  isMobileConversationListOpen: boolean
  searchDraft: string
}
