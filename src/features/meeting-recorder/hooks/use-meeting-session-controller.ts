import { useEffect, useRef, useState } from "react"
import { useShallow } from "zustand/react/shallow"

import { MEETING_DEFAULT_LANGUAGE } from "@/features/meeting-recorder/constants"
import { useMeetingRuntimeSubscriptions } from "@/features/meeting-recorder/hooks/use-meeting-runtime-subscriptions"
import {
  createBrowserMeetingMediaRuntime,
  createMeetingSessionController,
  type MeetingSessionController,
} from "@/features/meeting-recorder/services"
import { useMeetingSessionStore } from "@/features/meeting-recorder/stores"
import type {
  MeetingAudioLanguage,
  MeetingSessionStatus,
} from "@/features/meeting-recorder/types"

const ACTIVE_MEETING_SESSION_STATUSES = new Set<MeetingSessionStatus>([
  "preparing_media",
  "media_ready",
  "starting",
  "streaming",
  "finalizing",
])

const RESETTABLE_MEETING_SESSION_STATUSES = new Set<MeetingSessionStatus>([
  "completed",
  "failed",
  "interrupted",
  "stopped",
])

const WAITING_FOR_FINAL_NOTES_STATUSES = new Set<MeetingSessionStatus>([
  "completed",
  "interrupted",
])

export const useMeetingSessionController = () => {
  const [controller] = useState<MeetingSessionController>(() =>
    createMeetingSessionController({
      mediaRuntime: createBrowserMeetingMediaRuntime(),
    }),
  )
  const [selectedLanguage, setSelectedLanguage] =
    useState<MeetingAudioLanguage>(MEETING_DEFAULT_LANGUAGE)
  const pendingDisposeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  const sessionState = useMeetingSessionStore(
    useShallow((state) => ({
      acceptedConfig: state.acceptedConfig,
      committedUtterances: state.committedUtterances,
      derivedNotes: state.derivedNotes,
      draftUtterances: state.draftUtterances,
      identifiers: state.identifiers,
      lastEventAt: state.lastEventAt,
      noteChunks: state.noteChunks,
      sourceReadiness: state.sourceReadiness,
      status: state.status,
      terminalError: state.terminalError,
    })),
  )

  const canStart = !ACTIVE_MEETING_SESSION_STATUSES.has(sessionState.status)
  const canStop = ACTIVE_MEETING_SESSION_STATUSES.has(sessionState.status)
  const canFinalize = canStop && sessionState.status !== "finalizing"
  const canForceStop = canStop
  const canReset = RESETTABLE_MEETING_SESSION_STATUSES.has(sessionState.status)
  const isWaitingForFinalNotes = WAITING_FOR_FINAL_NOTES_STATUSES.has(
    sessionState.status,
  )

  useMeetingRuntimeSubscriptions({
    controller,
    enabled: canStop,
  })

  useEffect(() => {
    if (pendingDisposeTimeoutRef.current) {
      clearTimeout(pendingDisposeTimeoutRef.current)
      pendingDisposeTimeoutRef.current = null
    }

    return () => {
      pendingDisposeTimeoutRef.current = setTimeout(() => {
        pendingDisposeTimeoutRef.current = null
        void controller.dispose()
      }, 0)
    }
  }, [controller])

  return {
    ...sessionState,
    canFinalize,
    canForceStop,
    canReset,
    canStart,
    canStop,
    isWaitingForFinalNotes,
    resetMeetingSession: async () => {
      if (!canReset) {
        return
      }

      await controller.reset()
    },
    selectedLanguage,
    setSelectedLanguage,
    startMeetingSession: async () => {
      if (!canStart) {
        return
      }

      await controller.start({
        language: selectedLanguage,
      })
    },
    finalizeMeetingSession: async () => {
      if (!canFinalize) {
        return
      }

      await controller.stop()
    },
    forceStopMeetingSession: async () => {
      if (!canForceStop) {
        return
      }

      await controller.teardown({
        emitStop: true,
        error: null,
        preserveSessionState: true,
        status: "stopped",
      })
    },
  }
}
