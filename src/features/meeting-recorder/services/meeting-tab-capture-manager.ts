import type {
  MeetingDependencyLossHandler,
  PreparedMeetingSource,
} from "@/features/meeting-recorder/services/meeting-media-source-utils"
import {
  bindMeetingDependencyLossListeners,
  buildMeetingMediaError,
  createReadyMeetingSourceState,
  ensureSupportedMeetingBrowser,
  stopMeetingMediaStreamTracks,
} from "@/features/meeting-recorder/services/meeting-media-source-utils"

type ChromiumDisplayMediaOptions = MediaStreamConstraints & {
  preferCurrentTab?: boolean
  selfBrowserSurface?: "exclude" | "include"
  surfaceSwitching?: "exclude" | "include"
  systemAudio?: "exclude" | "include"
}

const MEETING_TAB_CAPTURE_OPTIONS: ChromiumDisplayMediaOptions = {
  audio: {
    channelCount: 2,
    echoCancellation: false,
    noiseSuppression: false,
    sampleRate: 48_000,
  },
  preferCurrentTab: true,
  selfBrowserSurface: "exclude",
  surfaceSwitching: "exclude",
  systemAudio: "include",
  video: {
    displaySurface: "browser",
    frameRate: 1,
  },
}

const validateMeetingTabStream = (stream: MediaStream): MediaStreamTrack => {
  if (!stream.active) {
    throw buildMeetingMediaError(
      "meeting_tab_stream_inactive",
      "The selected browser tab stream is not active.",
      "meeting_tab",
    )
  }

  const audioTrack = stream.getAudioTracks()[0]

  if (!audioTrack) {
    throw buildMeetingMediaError(
      "meeting_tab_audio_missing",
      "The selected browser tab does not expose a shareable audio track.",
      "meeting_tab",
    )
  }

  if (audioTrack.readyState !== "live") {
    throw buildMeetingMediaError(
      "meeting_tab_audio_inactive",
      "The selected browser tab audio track is not live.",
      "meeting_tab",
    )
  }

  const videoTrack = stream.getVideoTracks()[0]
  const displaySurface = videoTrack?.getSettings().displaySurface

  if (!videoTrack || (displaySurface && displaySurface !== "browser")) {
    throw buildMeetingMediaError(
      "meeting_tab_not_browser_surface",
      "Meeting recorder requires sharing a browser tab with the meeting audio.",
      "meeting_tab",
    )
  }

  return audioTrack
}

export const prepareMeetingTabCapture = async ({
  onDependencyLoss,
}: {
  onDependencyLoss: MeetingDependencyLossHandler
}): Promise<PreparedMeetingSource> => {
  ensureSupportedMeetingBrowser()

  let stream: MediaStream | null = null

  try {
    stream = await navigator.mediaDevices.getDisplayMedia(
      MEETING_TAB_CAPTURE_OPTIONS as MediaStreamConstraints,
    )
  } catch (error) {
    throw buildMeetingMediaError(
      "meeting_tab_capture_failed",
      error instanceof Error
        ? error.message
        : "Unable to access the shared meeting tab audio.",
      "meeting_tab",
    )
  }

  try {
    const track = validateMeetingTabStream(stream)
    track.contentHint = "speech"

    const releaseDependencyListeners = bindMeetingDependencyLossListeners({
      role: "meeting_tab",
      onDependencyLoss,
      stream,
      track,
    })

    return {
      audioStream: new MediaStream([track]),
      release: () => {
        releaseDependencyListeners()
        stopMeetingMediaStreamTracks(stream)
      },
      sourceReadiness: createReadyMeetingSourceState("meeting_tab"),
      stream,
      track,
    }
  } catch (error) {
    stopMeetingMediaStreamTracks(stream)
    throw error
  }
}
