import { createMeetingAudioTransformEngine } from "@/features/meeting-recorder/services/meeting-audio-transform-engine"
import { prepareMeetingTabCapture } from "@/features/meeting-recorder/services/meeting-tab-capture-manager"
import { prepareMeetingMicrophoneCapture } from "@/features/meeting-recorder/services/microphone-capture-manager"
import type {
  MeetingMediaRuntime,
  PreparedMeetingMediaSession,
} from "@/features/meeting-recorder/services/meeting-session-controller"
import type { PreparedMeetingSource } from "@/features/meeting-recorder/services/meeting-media-source-utils"

const releasePreparedSources = (preparedSources: PreparedMeetingSource[]): void => {
  preparedSources.forEach((preparedSource) => {
    preparedSource.release()
  })
}

export const createBrowserMeetingMediaRuntime = (): MeetingMediaRuntime => {
  return {
    prepareSession: async ({ identifiers, onDependencyLoss }) => {
      const preparedSources: PreparedMeetingSource[] = []

      try {
        const meetingTabCapture = await prepareMeetingTabCapture({
          onDependencyLoss,
        })
        preparedSources.push(meetingTabCapture)

        const microphoneCapture = await prepareMeetingMicrophoneCapture({
          onDependencyLoss,
        })
        preparedSources.push(microphoneCapture)

        const audioTransformEngine = await createMeetingAudioTransformEngine({
          identifiers,
          meetingTabStream: meetingTabCapture.audioStream,
          microphoneStream: microphoneCapture.audioStream,
          onDependencyLoss,
        })

        const preparedMediaSession: PreparedMeetingMediaSession = {
          sourceReadiness: {
            meeting_tab: meetingTabCapture.sourceReadiness,
            microphone: microphoneCapture.sourceReadiness,
          },
          startStreaming: async (emitFrame) => {
            await audioTransformEngine.start(emitFrame)
          },
          stopStreaming: async () => {
            await audioTransformEngine.stop()
          },
          teardown: async () => {
            try {
              await audioTransformEngine.teardown()
            } finally {
              releasePreparedSources(preparedSources)
            }
          },
        }

        return preparedMediaSession
      } catch (error) {
        releasePreparedSources(preparedSources)
        throw error
      }
    },
  }
}
