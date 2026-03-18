import { create } from "zustand"

import type {
  InterviewAcceptedSessionConfig,
  InterviewSessionError,
  InterviewSessionIdentifiers,
  InterviewSessionState,
  InterviewSessionStatus,
  InterviewSessionTerminalReason,
} from "@/features/interview-lab/types"
import type {
  InterviewAiAnswerState,
  InterviewClosedUtterance,
  InterviewOpenUtterance,
  InterviewSourceReadinessState,
  InterviewSourceRole,
} from "@/features/interview-lab/types"

const buildInitialSourceReadiness = (): Record<
  InterviewSourceRole,
  InterviewSourceReadinessState
> => ({
  interviewer: {
    role: "interviewer",
    status: "idle",
    isReady: false,
    error: null,
    updatedAt: null,
  },
  user: {
    role: "user",
    status: "idle",
    isReady: false,
    error: null,
    updatedAt: null,
  },
})

const buildInitialOpenUtterances = (): Record<InterviewSourceRole, InterviewOpenUtterance | null> => ({
  interviewer: null,
  user: null,
})

const initialState: InterviewSessionState = {
  identifiers: null,
  status: "idle",
  terminalReason: null,
  sourceReadiness: buildInitialSourceReadiness(),
  openUtterances: buildInitialOpenUtterances(),
  closedUtterances: [],
  aiAnswers: {},
  error: null,
  acceptedConfig: null,
  lastEventAt: null,
}

type InterviewSessionActions = {
  appendClosedUtterance: (utterance: InterviewClosedUtterance) => void
  clearOpenUtterance: (role: InterviewSourceRole) => void
  clearSessionError: () => void
  patchAiAnswer: (
    utteranceId: string,
    value: Partial<Omit<InterviewAiAnswerState, "utteranceId">>,
  ) => void
  resetSession: () => void
  setAcceptedConfig: (config: InterviewAcceptedSessionConfig | null) => void
  setIdentifiers: (identifiers: InterviewSessionIdentifiers | null) => void
  setOpenUtterance: (role: InterviewSourceRole, utterance: InterviewOpenUtterance | null) => void
  setSessionError: (error: InterviewSessionError | null) => void
  setSourceReadiness: (
    role: InterviewSourceRole,
    value: Partial<Omit<InterviewSourceReadinessState, "role">> &
      Pick<InterviewSourceReadinessState, "status">,
  ) => void
  setStatus: (status: InterviewSessionStatus) => void
  setTerminalReason: (terminalReason: InterviewSessionTerminalReason | null) => void
  upsertAiAnswer: (answer: InterviewAiAnswerState) => void
}

export const useInterviewSessionStore = create<
  InterviewSessionState & InterviewSessionActions
>((set) => ({
  ...initialState,
  appendClosedUtterance: (utterance) =>
    set((state) => {
      const existingIndex = state.closedUtterances.findIndex(
        (currentUtterance) => currentUtterance.utteranceId === utterance.utteranceId,
      )

      if (existingIndex === -1) {
        return {
          closedUtterances: [...state.closedUtterances, utterance],
          lastEventAt: utterance.turnClosedAt,
        }
      }

      const nextClosedUtterances = [...state.closedUtterances]
      nextClosedUtterances[existingIndex] = utterance

      return {
        closedUtterances: nextClosedUtterances,
        lastEventAt: utterance.turnClosedAt,
      }
    }),
  clearOpenUtterance: (role) =>
    set((state) => ({
      openUtterances: {
        ...state.openUtterances,
        [role]: null,
      },
      lastEventAt: new Date().toISOString(),
    })),
  clearSessionError: () => set({ error: null }),
  patchAiAnswer: (utteranceId, value) =>
    set((state) => {
      const existingAnswer = state.aiAnswers[utteranceId]

      if (!existingAnswer) {
        return state
      }

      return {
        aiAnswers: {
          ...state.aiAnswers,
          [utteranceId]: {
            ...existingAnswer,
            ...value,
            updatedAt: value.updatedAt ?? new Date().toISOString(),
          },
        },
      }
    }),
  resetSession: () =>
    set({
      ...initialState,
      sourceReadiness: buildInitialSourceReadiness(),
      openUtterances: buildInitialOpenUtterances(),
    }),
  setAcceptedConfig: (acceptedConfig) => set({ acceptedConfig }),
  setIdentifiers: (identifiers) => set({ identifiers }),
  setOpenUtterance: (role, utterance) =>
    set((state) => ({
      openUtterances: {
        ...state.openUtterances,
        [role]: utterance,
      },
      lastEventAt: utterance?.lastUpdatedAt ?? new Date().toISOString(),
    })),
  setSessionError: (error) => set({ error }),
  setSourceReadiness: (role, value) =>
    set((state) => ({
      sourceReadiness: {
        ...state.sourceReadiness,
        [role]: {
          ...state.sourceReadiness[role],
          ...value,
          isReady: value.isReady ?? value.status === "ready",
          updatedAt: value.updatedAt ?? new Date().toISOString(),
        },
      },
    })),
  setStatus: (status) => set({ status }),
  setTerminalReason: (terminalReason) => set({ terminalReason }),
  upsertAiAnswer: (answer) =>
    set((state) => ({
      aiAnswers: {
        ...state.aiAnswers,
        [answer.utteranceId]: answer,
      },
      lastEventAt: answer.updatedAt,
    })),
}))

export type { InterviewSessionActions }

