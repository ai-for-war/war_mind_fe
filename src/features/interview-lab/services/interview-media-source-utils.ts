import type {
  InterviewSessionError,
  InterviewSourceReadinessState,
  InterviewSourceRole,
} from "@/features/interview-lab/types"

type InterviewDependencyLossHandler = (error: InterviewSessionError) => void

type PreparedInterviewSource = {
  audioStream: MediaStream
  release: () => void
  sourceReadiness: InterviewSourceReadinessState
  stream: MediaStream
  track: MediaStreamTrack
}

const CHROMIUM_BROWSER_PATTERN = /(Chrome|Chromium|Edg)\/\d+/i

export const buildInterviewMediaError = (
  code: string,
  message: string,
  source: InterviewSessionError["source"],
  retryable = false,
): InterviewSessionError => {
  return {
    code,
    message,
    retryable,
    source,
    timestamp: Date.now(),
  }
}

export const ensureSupportedInterviewBrowser = (): void => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    throw buildInterviewMediaError(
      "browser_unavailable",
      "Interview lab browser APIs are unavailable in the current environment.",
      "runtime",
    )
  }

  if (!CHROMIUM_BROWSER_PATTERN.test(navigator.userAgent)) {
    throw buildInterviewMediaError(
      "unsupported_browser",
      "Interview lab currently supports Chromium-based browsers only.",
      "runtime",
    )
  }

  if (!navigator.mediaDevices) {
    throw buildInterviewMediaError(
      "media_devices_unavailable",
      "Media device APIs are unavailable in this browser.",
      "runtime",
    )
  }
}

export const createReadySourceState = (
  role: InterviewSourceRole,
): InterviewSourceReadinessState => {
  return {
    role,
    status: "ready",
    isReady: true,
    error: null,
    updatedAt: new Date().toISOString(),
  }
}

export const stopMediaStreamTracks = (stream: MediaStream): void => {
  stream.getTracks().forEach((track) => {
    track.stop()
  })
}

export const bindMediaDependencyLossListeners = ({
  role,
  onDependencyLoss,
  stream,
  track,
}: {
  onDependencyLoss: InterviewDependencyLossHandler
  role: InterviewSourceRole
  stream: MediaStream
  track: MediaStreamTrack
}): (() => void) => {
  let isReleased = false
  const source = role === "user" ? "microphone" : "interviewer_tab"

  const handleDependencyLoss = (message: string): void => {
    if (isReleased) {
      return
    }

    isReleased = true

    onDependencyLoss(
      buildInterviewMediaError(
        `${role}_source_lost`,
        message,
        source,
      ),
    )
  }

  const handleTrackEnded = (): void => {
    handleDependencyLoss(
      role === "user"
        ? "The microphone input ended during the active interview session."
        : "The shared interviewer tab audio ended during the active interview session.",
    )
  }

  const handleStreamInactive = (): void => {
    handleDependencyLoss(
      role === "user"
        ? "The microphone stream became inactive during the active interview session."
        : "The shared interviewer tab stream became inactive during the active interview session.",
    )
  }

  track.addEventListener("ended", handleTrackEnded)
  stream.addEventListener("inactive", handleStreamInactive)

  return () => {
    isReleased = true
    track.removeEventListener("ended", handleTrackEnded)
    stream.removeEventListener("inactive", handleStreamInactive)
  }
}

export type { InterviewDependencyLossHandler, PreparedInterviewSource }

