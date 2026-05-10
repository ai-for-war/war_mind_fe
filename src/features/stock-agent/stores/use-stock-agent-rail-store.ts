import { create } from "zustand"

type StockAgentRailState = {
  activeConversationId: string | null
  isConversationRailOpen: boolean
  isMobileConversationListOpen: boolean
  isPanelOpen: boolean
  searchDraft: string
}

type StockAgentRailActions = {
  resetForNewChat: () => void
  resetRailState: () => void
  setActiveConversationId: (conversationId: string | null) => void
  setConversationRailOpen: (isOpen: boolean) => void
  setMobileConversationListOpen: (isOpen: boolean) => void
  setPanelOpen: (isOpen: boolean) => void
  setSearchDraft: (search: string) => void
}

const initialState: StockAgentRailState = {
  activeConversationId: null,
  isConversationRailOpen: true,
  isMobileConversationListOpen: false,
  isPanelOpen: false,
  searchDraft: "",
}

export const useStockAgentRailStore = create<
  StockAgentRailState & StockAgentRailActions
>((set) => ({
  ...initialState,
  resetForNewChat: () => set({ activeConversationId: null }),
  resetRailState: () => set(initialState),
  setActiveConversationId: (activeConversationId) =>
    set({
      activeConversationId,
    }),
  setConversationRailOpen: (isConversationRailOpen) =>
    set({
      isConversationRailOpen,
    }),
  setMobileConversationListOpen: (isMobileConversationListOpen) =>
    set({
      isMobileConversationListOpen,
    }),
  setPanelOpen: (isPanelOpen) =>
    set({
      isPanelOpen,
    }),
  setSearchDraft: (searchDraft) =>
    set({
      searchDraft,
    }),
}))
