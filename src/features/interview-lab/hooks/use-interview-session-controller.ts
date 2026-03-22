import { useEffect, useRef, useState } from "react"
import { useShallow } from "zustand/react/shallow"

import { INTERVIEW_DEFAULT_LANGUAGE } from "@/features/interview-lab/constants"
import {
  createBrowserInterviewMediaRuntime,
  createInterviewSessionController,
  type InterviewSessionController,
} from "@/features/interview-lab/services"
import { useInterviewSessionStore } from "@/features/interview-lab/stores"
import { useInterviewRuntimeSubscriptions } from "@/features/interview-lab/hooks/use-interview-runtime-subscriptions"
import type { InterviewAudioLanguage } from "@/features/interview-lab/types"

const ACTIVE_INTERVIEW_SESSION_STATUSES = new Set([
  "preparing_media",
  "media_ready",
  "starting",
  "streaming",
  "finalizing",
  "stopping",
])

const RESETTABLE_INTERVIEW_SESSION_STATUSES = new Set([
  "stopped",
  "completed",
  "failed",
])

export const useInterviewSessionController = () => {
  const [controller] = useState<InterviewSessionController>(() =>
    createInterviewSessionController({
      mediaRuntime: createBrowserInterviewMediaRuntime(),
    }),
  )
  const [selectedLanguage, setSelectedLanguage] = useState<InterviewAudioLanguage>(
    INTERVIEW_DEFAULT_LANGUAGE,
  )
  const pendingDisposeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sessionState = useInterviewSessionStore(
    useShallow((state) => ({
      acceptedConfig: state.acceptedConfig,
      aiAnswers: state.aiAnswers,
      closedUtterances: state.closedUtterances,
      error: state.error,
      identifiers: state.identifiers,
      lastEventAt: state.lastEventAt,
      openUtterances: state.openUtterances,
      sourceReadiness: state.sourceReadiness,
      status: state.status,
      terminalReason: state.terminalReason,
    })),
  )

  const canStart = !ACTIVE_INTERVIEW_SESSION_STATUSES.has(sessionState.status)
  const canStop = ACTIVE_INTERVIEW_SESSION_STATUSES.has(sessionState.status)
  const canReset = RESETTABLE_INTERVIEW_SESSION_STATUSES.has(sessionState.status)

  useInterviewRuntimeSubscriptions({
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
    canReset,
    canStart,
    canStop,
    controller,
    resetInterviewSession: async () => {
      if (!canReset) {
        return
      }

      await controller.reset()
    },
    selectedLanguage,
    setSelectedLanguage,
    startInterviewSession: async () => {
      if (!canStart) {
        return
      }

      await controller.start({
        language: selectedLanguage,
      })
    },
    stopInterviewSession: async () => {
      if (!canStop) {
        return
      }

      await controller.stop()
    },
  }
}
