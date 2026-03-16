import type { InterviewDependencyLossHandler, PreparedInterviewSource } from "@/features/interview-lab/services/interview-media-source-utils"
import {
  bindMediaDependencyLossListeners,
  buildInterviewMediaError,
  createReadySourceState,
  ensureSupportedInterviewBrowser,
  stopMediaStreamTracks,
} from "@/features/interview-lab/services/interview-media-source-utils"

type ChromiumDisplayMediaOptions = MediaStreamConstraints & {
  preferCurrentTab?: boolean
  selfBrowserSurface?: "exclude" | "include"
  surfaceSwitching?: "exclude" | "include"
  systemAudio?: "exclude" | "include"
}

const INTERVIEWER_TAB_CAPTURE_OPTIONS: ChromiumDisplayMediaOptions = {
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

const validateInterviewerTabStream = (stream: MediaStream): MediaStreamTrack => {
  const audioTrack = stream.getAudioTracks()[0]

  if (!audioTrack) {
    throw buildInterviewMediaError(
      "interviewer_tab_audio_missing",
      "The selected browser tab does not expose a shareable audio track.",
      "interviewer_tab",
    )
  }

  if (audioTrack.readyState !== "live") {
    throw buildInterviewMediaError(
      "interviewer_tab_audio_inactive",
      "The selected browser tab audio track is not live.",
      "interviewer_tab",
    )
  }

  const videoTrack = stream.getVideoTracks()[0]
  const displaySurface = videoTrack?.getSettings().displaySurface

  if (displaySurface && displaySurface !== "browser") {
    throw buildInterviewMediaError(
      "interviewer_tab_not_browser_surface",
      "Interview lab requires sharing a browser tab with Google Meet audio.",
      "interviewer_tab",
    )
  }

  return audioTrack
}

export const prepareInterviewerTabCapture = async ({
  onDependencyLoss,
}: {
  onDependencyLoss: InterviewDependencyLossHandler
}): Promise<PreparedInterviewSource> => {
  ensureSupportedInterviewBrowser()

  let stream: MediaStream | null = null

  try {
    stream = await navigator.mediaDevices.getDisplayMedia(
      INTERVIEWER_TAB_CAPTURE_OPTIONS as MediaStreamConstraints,
    )
  } catch (error) {
    throw buildInterviewMediaError(
      "interviewer_tab_capture_failed",
      error instanceof Error
        ? error.message
        : "Unable to access the shared interviewer tab audio.",
      "interviewer_tab",
    )
  }

  try {
    const track = validateInterviewerTabStream(stream)
    track.contentHint = "speech"

    const releaseDependencyListeners = bindMediaDependencyLossListeners({
      role: "interviewer",
      onDependencyLoss,
      stream,
      track,
    })

    return {
      audioStream: new MediaStream([track]),
      release: () => {
        releaseDependencyListeners()
        stopMediaStreamTracks(stream)
      },
      sourceReadiness: createReadySourceState("interviewer"),
      stream,
      track,
    }
  } catch (error) {
    stopMediaStreamTracks(stream)
    throw error
  }
}

