import { create } from "zustand"

import type {
  MultiAgentRunStatus,
  MultiAgentStreamingAssistantState,
} from "@/features/multi-agent/types/chat-workspace.types"

const FRESH_CHAT_KEY = "__fresh_chat__"

const toConversationKey = (conversationId: string | null): string =>
  conversationId && conversationId.length > 0 ? conversationId : FRESH_CHAT_KEY

const omitKey = <TValue>(source: Record<string, TValue>, key: string): Record<string, TValue> => {
  const next = { ...source }
  delete next[key]
  return next
}

type MultiAgentChatWorkspaceState = {
  composerDraftByConversation: Record<string, string>
  runStatusByConversation: Record<string, MultiAgentRunStatus>
  streamingAssistantByConversation: Record<string, MultiAgentStreamingAssistantState>
  threadErrorByConversation: Record<string, string | null>
}

type MultiAgentChatWorkspaceActions = {
  appendStreamingAssistantToken: (conversationId: string, token: string) => void
  clearComposerDraft: (conversationId: string | null) => void
  clearStreamingAssistant: (conversationId: string) => void
  clearThreadError: (conversationId: string) => void
  resetConversationWorkspaceState: (conversationId: string | null) => void
  resetWorkspaceState: () => void
  setComposerDraft: (conversationId: string | null, draft: string) => void
  setRunStatus: (conversationId: string, status: MultiAgentRunStatus) => void
  setStreamingAssistant: (
    conversationId: string,
    value: Pick<MultiAgentStreamingAssistantState, "content" | "isStreaming">,
  ) => void
  setThreadError: (conversationId: string, error: string | null) => void
}

const initialState: MultiAgentChatWorkspaceState = {
  composerDraftByConversation: {},
  runStatusByConversation: {},
  streamingAssistantByConversation: {},
  threadErrorByConversation: {},
}

export const useMultiAgentChatWorkspaceStore = create<
  MultiAgentChatWorkspaceState & MultiAgentChatWorkspaceActions
>((set) => ({
  ...initialState,
  appendStreamingAssistantToken: (conversationId, token) =>
    set((state) => {
      const previous = state.streamingAssistantByConversation[conversationId]
      const previousContent = previous?.content ?? ""

      return {
        streamingAssistantByConversation: {
          ...state.streamingAssistantByConversation,
          [conversationId]: {
            content: `${previousContent}${token}`,
            isStreaming: true,
            updatedAt: new Date().toISOString(),
          },
        },
      }
    }),
  clearComposerDraft: (conversationId) =>
    set((state) => {
      const conversationKey = toConversationKey(conversationId)
      return {
        composerDraftByConversation: omitKey(
          state.composerDraftByConversation,
          conversationKey,
        ),
      }
    }),
  clearStreamingAssistant: (conversationId) =>
    set((state) => ({
      streamingAssistantByConversation: omitKey(
        state.streamingAssistantByConversation,
        conversationId,
      ),
    })),
  clearThreadError: (conversationId) =>
    set((state) => ({
      threadErrorByConversation: omitKey(state.threadErrorByConversation, conversationId),
    })),
  resetConversationWorkspaceState: (conversationId) =>
    set((state) => {
      const conversationKey = toConversationKey(conversationId)

      return {
        composerDraftByConversation: omitKey(
          state.composerDraftByConversation,
          conversationKey,
        ),
        runStatusByConversation: omitKey(state.runStatusByConversation, conversationKey),
        streamingAssistantByConversation: omitKey(
          state.streamingAssistantByConversation,
          conversationKey,
        ),
        threadErrorByConversation: omitKey(state.threadErrorByConversation, conversationKey),
      }
    }),
  resetWorkspaceState: () => set(initialState),
  setComposerDraft: (conversationId, draft) =>
    set((state) => {
      const conversationKey = toConversationKey(conversationId)

      return {
        composerDraftByConversation: {
          ...state.composerDraftByConversation,
          [conversationKey]: draft,
        },
      }
    }),
  setRunStatus: (conversationId, status) =>
    set((state) => ({
      runStatusByConversation: {
        ...state.runStatusByConversation,
        [conversationId]: status,
      },
    })),
  setStreamingAssistant: (conversationId, value) =>
    set((state) => ({
      streamingAssistantByConversation: {
        ...state.streamingAssistantByConversation,
        [conversationId]: {
          content: value.content,
          isStreaming: value.isStreaming,
          updatedAt: new Date().toISOString(),
        },
      },
    })),
  setThreadError: (conversationId, error) =>
    set((state) => ({
      threadErrorByConversation: {
        ...state.threadErrorByConversation,
        [conversationId]: error,
      },
    })),
}))
