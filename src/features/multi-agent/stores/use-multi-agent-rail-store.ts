import { create } from "zustand"

import type { ConversationStatusFilter } from "@/features/multi-agent/types/conversation.types"

type MultiAgentRailState = {
  activeConversationId: string | null
  isRailSheetOpen: boolean
  searchDraft: string
  selectedStatus: ConversationStatusFilter
}

type MultiAgentRailActions = {
  resetForNewChat: () => void
  resetRailState: () => void
  setActiveConversationId: (conversationId: string | null) => void
  setRailSheetOpen: (isOpen: boolean) => void
  setSearchDraft: (search: string) => void
  setSelectedStatus: (status: ConversationStatusFilter) => void
}

const initialState: MultiAgentRailState = {
  activeConversationId: null,
  isRailSheetOpen: false,
  searchDraft: "",
  selectedStatus: "active",
}

export const useMultiAgentRailStore = create<
  MultiAgentRailState & MultiAgentRailActions
>((set) => ({
  ...initialState,
  resetForNewChat: () => set({ activeConversationId: null }),
  resetRailState: () => set(initialState),
  setActiveConversationId: (conversationId) =>
    set({
      activeConversationId: conversationId,
    }),
  setRailSheetOpen: (isRailSheetOpen) =>
    set({
      isRailSheetOpen,
    }),
  setSearchDraft: (searchDraft) =>
    set({
      searchDraft,
    }),
  setSelectedStatus: (selectedStatus) =>
    set({
      selectedStatus,
    }),
}))
