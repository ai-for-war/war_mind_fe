import { create } from "zustand"

import type { ConversationStatusFilter } from "@/features/super-agent/types/conversation.types"

type SuperAgentRailState = {
  activeConversationId: string | null
  isRailSheetOpen: boolean
  searchDraft: string
  selectedStatus: ConversationStatusFilter
}

type SuperAgentRailActions = {
  resetForNewChat: () => void
  resetRailState: () => void
  setActiveConversationId: (conversationId: string | null) => void
  setRailSheetOpen: (isOpen: boolean) => void
  setSearchDraft: (search: string) => void
  setSelectedStatus: (status: ConversationStatusFilter) => void
}

const initialState: SuperAgentRailState = {
  activeConversationId: null,
  isRailSheetOpen: false,
  searchDraft: "",
  selectedStatus: "active",
}

export const useSuperAgentRailStore = create<
  SuperAgentRailState & SuperAgentRailActions
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
