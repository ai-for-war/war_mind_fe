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

const MICROPHONE_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    autoGainControl: true,
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
  },
  video: false,
}

export const prepareMeetingMicrophoneCapture = async ({
  onDependencyLoss,
}: {
  onDependencyLoss: MeetingDependencyLossHandler
}): Promise<PreparedMeetingSource> => {
  ensureSupportedMeetingBrowser()

  let stream: MediaStream | null = null

  try {
    stream = await navigator.mediaDevices.getUserMedia(MICROPHONE_CONSTRAINTS)
  } catch (error) {
    throw buildMeetingMediaError(
      "microphone_capture_failed",
      error instanceof Error
        ? error.message
        : "Unable to access the microphone input for meeting recorder.",
      "microphone",
    )
  }

  if (!stream.active) {
    stopMeetingMediaStreamTracks(stream)
    throw buildMeetingMediaError(
      "microphone_stream_inactive",
      "The selected microphone stream is not active.",
      "microphone",
    )
  }

  const track = stream.getAudioTracks()[0]

  if (!track) {
    stopMeetingMediaStreamTracks(stream)
    throw buildMeetingMediaError(
      "microphone_audio_track_missing",
      "The selected microphone stream does not expose a live audio track.",
      "microphone",
    )
  }

  if (track.readyState !== "live") {
    stopMeetingMediaStreamTracks(stream)
    throw buildMeetingMediaError(
      "microphone_audio_track_inactive",
      "The selected microphone audio track is not live.",
      "microphone",
    )
  }

  track.contentHint = "speech"

  const releaseDependencyListeners = bindMeetingDependencyLossListeners({
    role: "microphone",
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
    sourceReadiness: createReadyMeetingSourceState("microphone"),
    stream,
    track,
  }
}
