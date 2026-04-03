import { create } from "zustand"

import type {
  SuperAgentInlineActivityStep,
  SuperAgentInlineActivityStepStatus,
  SuperAgentInlineActivityTrace,
  SuperAgentInlineActivityTraceStatus,
  SuperAgentRunStatus,
  SuperAgentStreamingAssistantState,
} from "@/features/super-agent/types/chat-workspace.types"
import type {
  LeadAgentRuntimeCatalogResponse,
  SuperAgentRuntimeSelection,
} from "@/features/super-agent/types/runtime-catalog.types"
import {
  findLeadAgentRuntimeCatalogModel,
  findLeadAgentRuntimeCatalogProvider,
} from "@/features/super-agent/utils/runtime-catalog"

export const SUPER_AGENT_FRESH_CHAT_KEY = "__fresh_chat__"

export const toSuperAgentConversationKey = (conversationId: string | null): string =>
  conversationId && conversationId.length > 0 ? conversationId : SUPER_AGENT_FRESH_CHAT_KEY

const toConversationKey = (conversationId: string | null): string =>
  toSuperAgentConversationKey(conversationId)

const omitKey = <TValue>(source: Record<string, TValue>, key: string): Record<string, TValue> => {
  const next = { ...source }
  delete next[key]
  return next
}

type SuperAgentChatWorkspaceState = {
  activityTraceByConversation: Record<string, SuperAgentInlineActivityTrace>
  composerDraftByConversation: Record<string, string>
  composerRuntimeNoticeByConversation: Record<string, string | null>
  composerRuntimeSelectionByConversation: Record<string, SuperAgentRuntimeSelection>
  runStatusByConversation: Record<string, SuperAgentRunStatus>
  streamingAssistantByConversation: Record<string, SuperAgentStreamingAssistantState>
  threadErrorByConversation: Record<string, string | null>
}

type SuperAgentChatWorkspaceActions = {
  appendStreamingAssistantToken: (conversationId: string, token: string) => void
  clearActivityTrace: (conversationId: string | null) => void
  clearComposerDraft: (conversationId: string | null) => void
  clearComposerRuntimeNotice: (conversationId: string | null) => void
  clearComposerRuntimeSelection: (conversationId: string | null) => void
  clearStreamingAssistant: (conversationId: string) => void
  clearThreadError: (conversationId: string) => void
  rekeyComposerRuntimeSelection: (
    fromConversationId: string | null,
    toConversationId: string,
  ) => void
  resetConversationWorkspaceState: (conversationId: string | null) => void
  resetWorkspaceState: () => void
  setComposerDraft: (conversationId: string | null, draft: string) => void
  setComposerRuntimeNotice: (conversationId: string | null, notice: string | null) => void
  setComposerRuntimeSelection: (
    conversationId: string | null,
    selection: SuperAgentRuntimeSelection,
  ) => void
  setComposerRuntimeModel: (
    conversationId: string | null,
    args: {
      catalog: LeadAgentRuntimeCatalogResponse
      model: string
      provider?: string
    },
  ) => void
  setComposerRuntimeReasoning: (
    conversationId: string | null,
    reasoning: string | null,
  ) => void
  setInlineActivityTraceStatus: (
    conversationId: string,
    status: SuperAgentInlineActivityTraceStatus,
  ) => void
  setInlineActivityStepStatus: (
    conversationId: string,
    toolCallId: string,
    status: SuperAgentInlineActivityStepStatus,
  ) => void
  setRunStatus: (conversationId: string, status: SuperAgentRunStatus) => void
  setStreamingAssistant: (
    conversationId: string,
    value: Pick<SuperAgentStreamingAssistantState, "content" | "isStreaming">,
  ) => void
  setThreadError: (conversationId: string, error: string | null) => void
  upsertInlineActivityStep: (
    conversationId: string,
    step: Pick<SuperAgentInlineActivityStep, "arguments" | "status" | "toolCallId" | "toolName">,
  ) => void
}

const initialState: SuperAgentChatWorkspaceState = {
  activityTraceByConversation: {},
  composerDraftByConversation: {},
  composerRuntimeNoticeByConversation: {},
  composerRuntimeSelectionByConversation: {},
  runStatusByConversation: {},
  streamingAssistantByConversation: {},
  threadErrorByConversation: {},
}

export const useSuperAgentChatWorkspaceStore = create<
  SuperAgentChatWorkspaceState & SuperAgentChatWorkspaceActions
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
  clearActivityTrace: (conversationId) =>
    set((state) => {
      const conversationKey = toConversationKey(conversationId)

      return {
        activityTraceByConversation: omitKey(
          state.activityTraceByConversation,
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
  resetConversationWorkspaceState: (conversationId) =>
    set((state) => {
      const conversationKey = toConversationKey(conversationId)

      return {
        activityTraceByConversation: omitKey(
          state.activityTraceByConversation,
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
  setComposerRuntimeModel: (conversationId, args) =>
    set((state) => {
      const conversationKey = toConversationKey(conversationId)
      const nextProvider =
        (args.provider
          ? findLeadAgentRuntimeCatalogProvider(args.catalog, args.provider)
          : args.catalog.providers.find((provider) =>
              provider.models.some((modelEntry) => modelEntry.model === args.model),
            )) ?? null

      if (!nextProvider) {
        return state
      }

      const nextModel = findLeadAgentRuntimeCatalogModel(nextProvider, args.model)
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
  setInlineActivityTraceStatus: (conversationId, status) =>
    set((state) => {
      const currentTrace = state.activityTraceByConversation[conversationId]
      const now = new Date().toISOString()

      return {
        activityTraceByConversation: {
          ...state.activityTraceByConversation,
          [conversationId]: {
            completedAt:
              status === "completed" || status === "failed"
                ? currentTrace?.completedAt ?? now
                : null,
            startedAt: currentTrace?.startedAt ?? now,
            status,
            steps: currentTrace?.steps ?? [],
          },
        },
      }
    }),
  setInlineActivityStepStatus: (conversationId, toolCallId, status) =>
    set((state) => {
      const currentTrace = state.activityTraceByConversation[conversationId]
      if (!currentTrace) {
        return state
      }

      const now = new Date().toISOString()
      const nextSteps = currentTrace.steps.map((step) =>
        step.toolCallId === toolCallId
          ? {
              ...step,
              completedAt: status === "active" ? null : step.completedAt ?? now,
              status,
            }
          : step,
      )

      return {
        activityTraceByConversation: {
          ...state.activityTraceByConversation,
          [conversationId]: {
            ...currentTrace,
            steps: nextSteps,
          },
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
  upsertInlineActivityStep: (conversationId, step) =>
    set((state) => {
      const currentTrace = state.activityTraceByConversation[conversationId]
      const now = new Date().toISOString()
      const nextStep: SuperAgentInlineActivityStep = {
        arguments: step.arguments,
        completedAt: step.status === "active" ? null : now,
        startedAt:
          currentTrace?.steps.find((currentStep) => currentStep.toolCallId === step.toolCallId)
            ?.startedAt ?? now,
        status: step.status,
        toolCallId: step.toolCallId,
        toolName: step.toolName,
      }
      const existingIndex =
        currentTrace?.steps.findIndex((currentStep) => currentStep.toolCallId === step.toolCallId) ??
        -1
      const nextSteps =
        existingIndex >= 0
          ? (currentTrace?.steps ?? []).map((currentStep, index) =>
              index === existingIndex ? nextStep : currentStep,
            )
          : [...(currentTrace?.steps ?? []), nextStep]

      return {
        activityTraceByConversation: {
          ...state.activityTraceByConversation,
          [conversationId]: {
            completedAt: currentTrace?.completedAt ?? null,
            startedAt: currentTrace?.startedAt ?? now,
            status: currentTrace?.status ?? "streaming",
            steps: nextSteps,
          },
        },
      }
    }),
}))
