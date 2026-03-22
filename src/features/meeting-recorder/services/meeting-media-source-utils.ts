import type {
  MeetingSessionError,
  MeetingSourceReadinessState,
  MeetingSourceRole,
} from "@/features/meeting-recorder/types"

type MeetingDependencyLossHandler = (error: MeetingSessionError) => void

type PreparedMeetingSource = {
  audioStream: MediaStream
  release: () => void
  sourceReadiness: MeetingSourceReadinessState
  stream: MediaStream
  track: MediaStreamTrack
}

const CHROMIUM_BROWSER_PATTERN = /(Chrome|Chromium|Edg)\/\d+/i

export const buildMeetingMediaError = (
  code: string,
  message: string,
  source: MeetingSessionError["source"],
  retryable = false,
): MeetingSessionError => {
  return {
    code,
    message,
    retryable,
    source,
    timestamp: Date.now(),
  }
}

export const ensureSupportedMeetingBrowser = (): void => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    throw buildMeetingMediaError(
      "browser_unavailable",
      "Meeting recorder browser APIs are unavailable in the current environment.",
      "runtime",
    )
  }

  if (!CHROMIUM_BROWSER_PATTERN.test(navigator.userAgent)) {
    throw buildMeetingMediaError(
      "unsupported_browser",
      "Meeting recorder currently supports Chromium-based browsers only.",
      "runtime",
    )
  }

  if (
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getUserMedia !== "function" ||
    typeof navigator.mediaDevices.getDisplayMedia !== "function"
  ) {
    throw buildMeetingMediaError(
      "media_devices_unavailable",
      "Required media device APIs are unavailable in this browser.",
      "runtime",
    )
  }
}

export const createReadyMeetingSourceState = (
  role: MeetingSourceRole,
): MeetingSourceReadinessState => {
  return {
    role,
    status: "ready",
    isReady: true,
    error: null,
    updatedAt: new Date().toISOString(),
  }
}

export const stopMeetingMediaStreamTracks = (stream: MediaStream): void => {
  stream.getTracks().forEach((track) => {
    track.stop()
  })
}

export const bindMeetingDependencyLossListeners = ({
  role,
  onDependencyLoss,
  stream,
  track,
}: {
  onDependencyLoss: MeetingDependencyLossHandler
  role: MeetingSourceRole
  stream: MediaStream
  track: MediaStreamTrack
}): (() => void) => {
  let isReleased = false

  const handleDependencyLoss = (message: string): void => {
    if (isReleased) {
      return
    }

    isReleased = true

    onDependencyLoss(
      buildMeetingMediaError(
        `${role}_source_lost`,
        message,
        role,
      ),
    )
  }

  const handleTrackEnded = (): void => {
    handleDependencyLoss(
      role === "microphone"
        ? "The microphone input ended during the active meeting session."
        : "The shared meeting tab audio ended during the active meeting session.",
    )
  }

  const handleStreamInactive = (): void => {
    handleDependencyLoss(
      role === "microphone"
        ? "The microphone stream became inactive during the active meeting session."
        : "The shared meeting tab stream became inactive during the active meeting session.",
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

export type { MeetingDependencyLossHandler, PreparedMeetingSource }
