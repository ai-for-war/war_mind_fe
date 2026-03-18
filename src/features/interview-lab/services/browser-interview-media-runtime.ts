import { createInterviewAudioTransformEngine } from "@/features/interview-lab/services/audio-transform-engine"
import { prepareInterviewerTabCapture } from "@/features/interview-lab/services/interviewer-tab-capture-manager"
import { prepareMicrophoneCapture } from "@/features/interview-lab/services/microphone-capture-manager"
import type { InterviewMediaRuntime, PreparedInterviewMediaSession } from "@/features/interview-lab/services/interview-session-controller"
import type { PreparedInterviewSource } from "@/features/interview-lab/services/interview-media-source-utils"

const releasePreparedSources = (
  preparedSources: PreparedInterviewSource[],
): void => {
  preparedSources.forEach((preparedSource) => {
    preparedSource.release()
  })
}

export const createBrowserInterviewMediaRuntime = (): InterviewMediaRuntime => {
  return {
    prepareSession: async ({ identifiers, onDependencyLoss }) => {
      const preparedSources: PreparedInterviewSource[] = []

      try {
        const interviewerCapture = await prepareInterviewerTabCapture({
          onDependencyLoss,
        })
        preparedSources.push(interviewerCapture)

        const microphoneCapture = await prepareMicrophoneCapture({
          onDependencyLoss,
        })
        preparedSources.push(microphoneCapture)

        const audioTransformEngine = await createInterviewAudioTransformEngine({
          identifiers,
          interviewerStream: interviewerCapture.audioStream,
          onDependencyLoss,
          userStream: microphoneCapture.audioStream,
        })

        const preparedMediaSession: PreparedInterviewMediaSession = {
          sourceReadiness: {
            interviewer: interviewerCapture.sourceReadiness,
            user: microphoneCapture.sourceReadiness,
          },
          startStreaming: async (emitFrame) => {
            await audioTransformEngine.start(emitFrame)
          },
          stopStreaming: async () => {
            await audioTransformEngine.stop()
          },
          teardown: async () => {
            await audioTransformEngine.teardown()
            releasePreparedSources(preparedSources)
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

