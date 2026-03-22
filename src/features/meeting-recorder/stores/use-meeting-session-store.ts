import { create } from "zustand"

import type {
  MeetingAcceptedSessionConfig,
  MeetingClosedUtterance,
  MeetingDraftUtterance,
  MeetingNoteChunk,
  MeetingSessionError,
  MeetingSessionIdentifiers,
  MeetingSessionState,
  MeetingSessionStatus,
  MeetingSourceReadinessState,
  MeetingSourceRole,
} from "@/features/meeting-recorder/types"
import {
  createEmptyMeetingDerivedNotes,
  deriveMeetingNotesState,
  upsertMeetingCommittedUtterance,
  upsertMeetingNoteChunk,
} from "@/features/meeting-recorder/utils"

const normalizeTranscriptFragment = (value: string): string => {
  return value.replace(/\s+/g, " ").trim()
}

const mergeDraftCombinedText = (
  previousText: string,
  nextText: string,
): string => {
  const normalizedPreviousText = normalizeTranscriptFragment(previousText)
  const normalizedNextText = normalizeTranscriptFragment(nextText)

  if (!normalizedPreviousText) {
    return normalizedNextText
  }

  if (!normalizedNextText) {
    return normalizedPreviousText
  }

  if (normalizedNextText.startsWith(normalizedPreviousText)) {
    return normalizedNextText
  }

  if (normalizedPreviousText.startsWith(normalizedNextText)) {
    return normalizedPreviousText
  }

  return `${normalizedPreviousText} ${normalizedNextText}`
}

const buildInitialSourceReadiness = (): Record<
  MeetingSourceRole,
  MeetingSourceReadinessState
> => ({
  meeting_tab: {
    role: "meeting_tab",
    status: "idle",
    isReady: false,
    error: null,
    updatedAt: null,
  },
  microphone: {
    role: "microphone",
    status: "idle",
    isReady: false,
    error: null,
    updatedAt: null,
  },
})

const initialState: MeetingSessionState = {
  identifiers: null,
  status: "idle",
  sourceReadiness: buildInitialSourceReadiness(),
  draftUtterances: {},
  committedUtterances: [],
  noteChunks: [],
  derivedNotes: createEmptyMeetingDerivedNotes(),
  terminalError: null,
  acceptedConfig: null,
  lastEventAt: null,
}

type MeetingSessionActions = {
  appendCommittedUtterance: (utterance: MeetingClosedUtterance) => void
  clearDraftUtterance: (utteranceId: string) => void
  clearTerminalError: () => void
  patchIdentifiers: (value: Partial<MeetingSessionIdentifiers>) => void
  resetSession: () => void
  setAcceptedConfig: (config: MeetingAcceptedSessionConfig | null) => void
  setDraftUtterance: (utterance: MeetingDraftUtterance) => void
  setIdentifiers: (identifiers: MeetingSessionIdentifiers | null) => void
  setSourceReadiness: (
    role: MeetingSourceRole,
    value: Partial<Omit<MeetingSourceReadinessState, "role">> &
      Pick<MeetingSourceReadinessState, "status">,
  ) => void
  setStatus: (status: MeetingSessionStatus) => void
  setTerminalError: (error: MeetingSessionError | null) => void
  upsertNoteChunk: (noteChunk: MeetingNoteChunk) => void
}

export const useMeetingSessionStore = create<
  MeetingSessionState & MeetingSessionActions
>((set) => ({
  ...initialState,
  appendCommittedUtterance: (utterance) =>
    set((state) => {
      const remainingDraftUtterances = { ...state.draftUtterances }
      delete remainingDraftUtterances[utterance.utteranceId]

      return {
        committedUtterances: upsertMeetingCommittedUtterance(
          state.committedUtterances,
          utterance,
        ),
        draftUtterances: remainingDraftUtterances,
        lastEventAt: utterance.createdAt,
      }
    }),
  clearDraftUtterance: (utteranceId) =>
    set((state) => {
      if (!(utteranceId in state.draftUtterances)) {
        return state
      }

      const remainingDraftUtterances = { ...state.draftUtterances }
      delete remainingDraftUtterances[utteranceId]

      return {
        draftUtterances: remainingDraftUtterances,
        lastEventAt: new Date().toISOString(),
      }
    }),
  clearTerminalError: () => set({ terminalError: null }),
  patchIdentifiers: (value) =>
    set((state) => {
      if (!state.identifiers) {
        return state
      }

      return {
        identifiers: {
          ...state.identifiers,
          ...value,
        },
      }
    }),
  resetSession: () =>
    set({
      ...initialState,
      sourceReadiness: buildInitialSourceReadiness(),
      derivedNotes: createEmptyMeetingDerivedNotes(),
    }),
  setAcceptedConfig: (acceptedConfig) => set({ acceptedConfig }),
  setDraftUtterance: (utterance) =>
    set((state) => {
      const previousUtterance = state.draftUtterances[utterance.utteranceId]

      return {
        draftUtterances: {
          ...state.draftUtterances,
          [utterance.utteranceId]: previousUtterance
            ? {
                ...utterance,
                combinedText: mergeDraftCombinedText(
                  previousUtterance.combinedText,
                  utterance.combinedText,
                ),
              }
            : utterance,
        },
        lastEventAt: utterance.lastUpdatedAt,
      }
    }),
  setIdentifiers: (identifiers) => set({ identifiers }),
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
  setTerminalError: (terminalError) =>
    set(
      terminalError
        ? {
            terminalError,
            lastEventAt: new Date(terminalError.timestamp).toISOString(),
          }
        : { terminalError: null },
    ),
  upsertNoteChunk: (noteChunk) =>
    set((state) => {
      const noteChunks = upsertMeetingNoteChunk(state.noteChunks, noteChunk)

      return {
        noteChunks,
        derivedNotes: deriveMeetingNotesState(noteChunks),
        lastEventAt: noteChunk.createdAt,
      }
    }),
}))

export type { MeetingSessionActions }
