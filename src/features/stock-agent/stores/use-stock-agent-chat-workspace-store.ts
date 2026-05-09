import { create } from "zustand"

import type {
  StockAgentActivityLineState,
  StockAgentActivityLineStatus,
  StockAgentRunStatus,
  StockAgentStreamingAssistantState,
} from "@/features/stock-agent/types/chat-workspace.types"
import type {
  StockAgentRuntimeCatalogResponse,
  StockAgentRuntimeSelection,
} from "@/features/stock-agent/types/runtime-catalog.types"
import {
  findStockAgentRuntimeCatalogModel,
  findStockAgentRuntimeCatalogProvider,
} from "@/features/stock-agent/utils/runtime-catalog"

export const STOCK_AGENT_FRESH_CHAT_KEY = "__stock_agent_fresh_chat__"

export const toStockAgentConversationKey = (conversationId: string | null): string =>
  conversationId && conversationId.length > 0 ? conversationId : STOCK_AGENT_FRESH_CHAT_KEY

const toConversationKey = (conversationId: string | null): string =>
  toStockAgentConversationKey(conversationId)

const omitKey = <TValue>(source: Record<string, TValue>, key: string): Record<string, TValue> => {
  const next = { ...source }
  delete next[key]
  return next
}

type StockAgentChatWorkspaceState = {
  activityLineByConversation: Record<string, StockAgentActivityLineState>
  composerDraftByConversation: Record<string, string>
  composerRuntimeNoticeByConversation: Record<string, string | null>
  composerRuntimeSelectionByConversation: Record<string, StockAgentRuntimeSelection>
  composerSubagentEnabledByConversation: Record<string, boolean>
  runStatusByConversation: Record<string, StockAgentRunStatus>
  streamingAssistantByConversation: Record<string, StockAgentStreamingAssistantState>
  threadErrorByConversation: Record<string, string | null>
}

type StockAgentChatWorkspaceActions = {
  appendStreamingAssistantToken: (conversationId: string, token: string) => void
  clearActivityLine: (conversationId: string | null) => void
  clearComposerDraft: (conversationId: string | null) => void
  clearComposerRuntimeNotice: (conversationId: string | null) => void
  clearComposerRuntimeSelection: (conversationId: string | null) => void
  clearComposerSubagentEnabled: (conversationId: string | null) => void
  clearStreamingAssistant: (conversationId: string) => void
  clearThreadError: (conversationId: string) => void
  recordActivityLineAction: (
    conversationId: string,
    action: {
      label: string
      toolCallId?: string | null
      toolName?: string | null
    },
  ) => void
  rekeyComposerRuntimeSelection: (
    fromConversationId: string | null,
    toConversationId: string,
  ) => void
  rekeyComposerSubagentEnabled: (
    fromConversationId: string | null,
    toConversationId: string,
  ) => void
  resetConversationWorkspaceState: (conversationId: string | null) => void
  resetWorkspaceState: () => void
  setActivityLineStatus: (
    conversationId: string,
    status: StockAgentActivityLineStatus,
    latestAction?: string,
  ) => void
  touchActivityLineToolEnd: (conversationId: string, toolCallId: string) => void
  setComposerDraft: (conversationId: string | null, draft: string) => void
  setComposerRuntimeModel: (
    conversationId: string | null,
    args: {
      catalog: StockAgentRuntimeCatalogResponse
      model: string
      provider?: string
    },
  ) => void
  setComposerRuntimeNotice: (conversationId: string | null, notice: string | null) => void
  setComposerRuntimeReasoning: (
    conversationId: string | null,
    reasoning: string | null,
  ) => void
  setComposerRuntimeSelection: (
    conversationId: string | null,
    selection: StockAgentRuntimeSelection,
  ) => void
  setComposerSubagentEnabled: (conversationId: string | null, enabled: boolean) => void
  setRunStatus: (conversationId: string, status: StockAgentRunStatus) => void
  setStreamingAssistant: (
    conversationId: string,
    value: Pick<StockAgentStreamingAssistantState, "content" | "isStreaming">,
  ) => void
  setThreadError: (conversationId: string, error: string | null) => void
}

const initialState: StockAgentChatWorkspaceState = {
  activityLineByConversation: {},
  composerDraftByConversation: {},
  composerRuntimeNoticeByConversation: {},
  composerRuntimeSelectionByConversation: {},
  composerSubagentEnabledByConversation: {},
  runStatusByConversation: {},
  streamingAssistantByConversation: {},
  threadErrorByConversation: {},
}

export const useStockAgentChatWorkspaceStore = create<
  StockAgentChatWorkspaceState & StockAgentChatWorkspaceActions
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
  clearActivityLine: (conversationId) =>
    set((state) => {
      const conversationKey = toConversationKey(conversationId)

      return {
        activityLineByConversation: omitKey(
          state.activityLineByConversation,
          conversationKey,
        ),
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
  clearComposerRuntimeNotice: (conversationId) =>
    set((state) => {
      const conversationKey = toConversationKey(conversationId)

      return {
        composerRuntimeNoticeByConversation: omitKey(
          state.composerRuntimeNoticeByConversation,
          conversationKey,
        ),
      }
    }),
  clearComposerRuntimeSelection: (conversationId) =>
    set((state) => {
      const conversationKey = toConversationKey(conversationId)

      return {
        composerRuntimeSelectionByConversation: omitKey(
          state.composerRuntimeSelectionByConversation,
          conversationKey,
        ),
      }
    }),
  clearComposerSubagentEnabled: (conversationId) =>
    set((state) => {
      const conversationKey = toConversationKey(conversationId)

      return {
        composerSubagentEnabledByConversation: omitKey(
          state.composerSubagentEnabledByConversation,
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
  recordActivityLineAction: (conversationId, action) =>
    set((state) => {
      const currentActivity = state.activityLineByConversation[conversationId]
      const now = new Date().toISOString()

      return {
        activityLineByConversation: {
          ...state.activityLineByConversation,
          [conversationId]: {
            actionCount: (currentActivity?.actionCount ?? 0) + 1,
            completedAt: null,
            latestAction: action.label,
            latestToolCallId: action.toolCallId ?? null,
            latestToolName: action.toolName ?? null,
            startedAt: currentActivity?.startedAt ?? now,
            status: "streaming",
            updatedAt: now,
          },
        },
      }
    }),
  rekeyComposerRuntimeSelection: (fromConversationId, toConversationId) =>
    set((state) => {
      const fromKey = toConversationKey(fromConversationId)
      const toKey = toConversationKey(toConversationId)
      const selection = state.composerRuntimeSelectionByConversation[fromKey]
      const notice = state.composerRuntimeNoticeByConversation[fromKey]

      return {
        composerRuntimeNoticeByConversation: notice
          ? {
              ...omitKey(state.composerRuntimeNoticeByConversation, fromKey),
              [toKey]: notice,
            }
          : omitKey(state.composerRuntimeNoticeByConversation, fromKey),
        composerRuntimeSelectionByConversation: selection
          ? {
              ...omitKey(state.composerRuntimeSelectionByConversation, fromKey),
              [toKey]: selection,
            }
          : omitKey(state.composerRuntimeSelectionByConversation, fromKey),
      }
    }),
  rekeyComposerSubagentEnabled: (fromConversationId, toConversationId) =>
    set((state) => {
      const fromKey = toConversationKey(fromConversationId)
      const toKey = toConversationKey(toConversationId)
      const isEnabled = state.composerSubagentEnabledByConversation[fromKey]

      return {
        composerSubagentEnabledByConversation: isEnabled
          ? {
              ...omitKey(state.composerSubagentEnabledByConversation, fromKey),
              [toKey]: isEnabled,
            }
          : omitKey(state.composerSubagentEnabledByConversation, fromKey),
      }
    }),
  resetConversationWorkspaceState: (conversationId) =>
    set((state) => {
      const conversationKey = toConversationKey(conversationId)

      return {
        activityLineByConversation: omitKey(
          state.activityLineByConversation,
          conversationKey,
        ),
        composerDraftByConversation: omitKey(
          state.composerDraftByConversation,
          conversationKey,
        ),
        composerRuntimeNoticeByConversation: omitKey(
          state.composerRuntimeNoticeByConversation,
          conversationKey,
        ),
        composerRuntimeSelectionByConversation: omitKey(
          state.composerRuntimeSelectionByConversation,
          conversationKey,
        ),
        composerSubagentEnabledByConversation: omitKey(
          state.composerSubagentEnabledByConversation,
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
  setActivityLineStatus: (conversationId, status, latestAction) =>
    set((state) => {
      const currentActivity = state.activityLineByConversation[conversationId]
      const now = new Date().toISOString()

      if (!currentActivity) {
        return state
      }

      return {
        activityLineByConversation: {
          ...state.activityLineByConversation,
          [conversationId]: {
            ...currentActivity,
            completedAt:
              status === "completed" || status === "failed"
                ? currentActivity.completedAt ?? now
                : null,
            latestAction: latestAction ?? currentActivity.latestAction,
            status,
            updatedAt: now,
          },
        },
      }
    }),
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
  setComposerRuntimeModel: (conversationId, args) =>
    set((state) => {
      const conversationKey = toConversationKey(conversationId)
      const nextProvider =
        (args.provider
          ? findStockAgentRuntimeCatalogProvider(args.catalog, args.provider)
          : args.catalog.providers.find((provider) =>
              provider.models.some((modelEntry) => modelEntry.model === args.model),
            )) ?? null

      if (!nextProvider) {
        return state
      }

      const nextModel = findStockAgentRuntimeCatalogModel(nextProvider, args.model)
      if (!nextModel) {
        return state
      }

      const currentSelection = state.composerRuntimeSelectionByConversation[conversationKey]
      const nextReasoning = nextModel.reasoning_options.length
        ? nextModel.reasoning_options.find((option) => option === currentSelection?.reasoning) ??
          nextModel.reasoning_options.find((option) => option === nextModel.default_reasoning) ??
          nextModel.reasoning_options[0] ??
          null
        : null

      return {
        composerRuntimeSelectionByConversation: {
          ...state.composerRuntimeSelectionByConversation,
          [conversationKey]: {
            model: nextModel.model,
            provider: nextProvider.provider,
            reasoning: nextReasoning,
          },
        },
      }
    }),
  setComposerRuntimeNotice: (conversationId, notice) =>
    set((state) => {
      const conversationKey = toConversationKey(conversationId)

      return {
        composerRuntimeNoticeByConversation: {
          ...state.composerRuntimeNoticeByConversation,
          [conversationKey]: notice,
        },
      }
    }),
  setComposerRuntimeReasoning: (conversationId, reasoning) =>
    set((state) => {
      const conversationKey = toConversationKey(conversationId)
      const currentSelection = state.composerRuntimeSelectionByConversation[conversationKey]

      if (!currentSelection) {
        return state
      }

      return {
        composerRuntimeSelectionByConversation: {
          ...state.composerRuntimeSelectionByConversation,
          [conversationKey]: {
            ...currentSelection,
            reasoning,
          },
        },
      }
    }),
  setComposerRuntimeSelection: (conversationId, selection) =>
    set((state) => {
      const conversationKey = toConversationKey(conversationId)

      return {
        composerRuntimeSelectionByConversation: {
          ...state.composerRuntimeSelectionByConversation,
          [conversationKey]: selection,
        },
      }
    }),
  setComposerSubagentEnabled: (conversationId, enabled) =>
    set((state) => {
      const conversationKey = toConversationKey(conversationId)

      return {
        composerSubagentEnabledByConversation: {
          ...state.composerSubagentEnabledByConversation,
          [conversationKey]: enabled,
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
  touchActivityLineToolEnd: (conversationId, toolCallId) =>
    set((state) => {
      const currentActivity = state.activityLineByConversation[conversationId]

      if (!currentActivity || currentActivity.latestToolCallId !== toolCallId) {
        return state
      }

      return {
        activityLineByConversation: {
          ...state.activityLineByConversation,
          [conversationId]: {
            ...currentActivity,
            updatedAt: new Date().toISOString(),
          },
        },
      }
    }),
}))
