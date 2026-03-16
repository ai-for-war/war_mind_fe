import type { InterviewDependencyLossHandler, PreparedInterviewSource } from "@/features/interview-lab/services/interview-media-source-utils"
import {
  bindMediaDependencyLossListeners,
  buildInterviewMediaError,
  createReadySourceState,
  ensureSupportedInterviewBrowser,
  stopMediaStreamTracks,
} from "@/features/interview-lab/services/interview-media-source-utils"

const MICROPHONE_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    autoGainControl: true,
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
  },
  video: false,
}

export const prepareMicrophoneCapture = async ({
  onDependencyLoss,
}: {
  onDependencyLoss: InterviewDependencyLossHandler
}): Promise<PreparedInterviewSource> => {
  ensureSupportedInterviewBrowser()

  let stream: MediaStream | null = null

  try {
    stream = await navigator.mediaDevices.getUserMedia(MICROPHONE_CONSTRAINTS)
  } catch (error) {
    throw buildInterviewMediaError(
      "microphone_capture_failed",
      error instanceof Error
        ? error.message
        : "Unable to access the microphone input for interview lab.",
      "microphone",
    )
  }

  const track = stream.getAudioTracks()[0]

  if (!track) {
    stopMediaStreamTracks(stream)
    throw buildInterviewMediaError(
      "microphone_audio_track_missing",
      "The selected microphone stream does not expose a live audio track.",
      "microphone",
    )
  }

  if (track.readyState !== "live") {
    stopMediaStreamTracks(stream)
    throw buildInterviewMediaError(
      "microphone_audio_track_inactive",
      "The selected microphone audio track is not live.",
      "microphone",
    )
  }

  track.contentHint = "speech"

  const releaseDependencyListeners = bindMediaDependencyLossListeners({
    role: "user",
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
    sourceReadiness: createReadySourceState("user"),
    stream,
    track,
  }
}

