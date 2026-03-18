import { INTERVIEW_AUDIO_METADATA_DEFAULTS } from "@/features/interview-lab/constants"
import type {
  InterviewMediaPreparationOptions,
  PreparedInterviewMediaSession,
} from "@/features/interview-lab/services/interview-session-controller"
import { buildInterviewMediaError } from "@/features/interview-lab/services/interview-media-source-utils"
import type {
  InterviewAudioFrame,
  InterviewAudioFrameMetadata,
} from "@/features/interview-lab/types"

const INTERVIEW_AUDIO_WORKLET_PROCESSOR_NAME = "interview-source-processor"
const INTERVIEW_AUDIO_WORKLET_MODULE_PATH = "/interview-audio-source-processor.js"

type InterviewFrameEmitter = PreparedInterviewMediaSession["startStreaming"] extends (
  emitFrame: infer TEmitFrame,
) => Promise<void> | void
  ? TEmitFrame
  : never

type AudioTransformEngineRole = "interviewer" | "user"

type AudioTransformEngine = {
  start: (emitFrame: InterviewFrameEmitter) => Promise<void>
  stop: () => Promise<void>
  teardown: () => Promise<void>
}

type CreateAudioTransformEngineOptions = Pick<
  InterviewMediaPreparationOptions,
  "identifiers" | "onDependencyLoss"
> & {
  interviewerStream: MediaStream
  userStream: MediaStream
}

type AudioTransformWorkletMessage = {
  buffer?: ArrayBuffer
}

class Float32SampleQueue {
  private readonly chunks: Float32Array[] = []

  private chunkOffset = 0

  private totalLength = 0

  enqueue(samples: Float32Array): void {
    if (samples.length === 0) {
      return
    }

    this.chunks.push(samples)
    this.totalLength += samples.length
  }

  clear(): void {
    this.chunks.length = 0
    this.chunkOffset = 0
    this.totalLength = 0
  }

  dequeue(frameSize: number): Float32Array {
    const output = new Float32Array(frameSize)
    let outputOffset = 0

    while (outputOffset < frameSize && this.chunks.length > 0) {
      const currentChunk = this.chunks[0]
      const availableChunkLength = currentChunk.length - this.chunkOffset
      const copyLength = Math.min(frameSize - outputOffset, availableChunkLength)

      output.set(
        currentChunk.subarray(
          this.chunkOffset,
          this.chunkOffset + copyLength,
        ),
        outputOffset,
      )

      outputOffset += copyLength
      this.chunkOffset += copyLength
      this.totalLength -= copyLength

      if (this.chunkOffset >= currentChunk.length) {
        this.chunks.shift()
        this.chunkOffset = 0
      }
    }

    return output
  }

  get length(): number {
    return this.totalLength
  }
}

class StreamingResampler {
  private readonly step: number

  private sourceBuffer = new Float32Array(0)

  private sourcePosition = 0

  constructor(
    inputSampleRate: number,
    outputSampleRate: number,
  ) {
    this.step = inputSampleRate / outputSampleRate
  }

  push(samples: Float32Array): Float32Array {
    if (samples.length === 0) {
      return new Float32Array(0)
    }

    if (this.step === 1) {
      return samples
    }

    const nextBuffer = new Float32Array(this.sourceBuffer.length + samples.length)
    nextBuffer.set(this.sourceBuffer, 0)
    nextBuffer.set(samples, this.sourceBuffer.length)
    this.sourceBuffer = nextBuffer

    const outputSamples: number[] = []

    while (this.sourcePosition + 1 < this.sourceBuffer.length) {
      const currentSampleIndex = Math.floor(this.sourcePosition)
      const fractionalOffset = this.sourcePosition - currentSampleIndex
      const leftSample = this.sourceBuffer[currentSampleIndex]
      const rightSample = this.sourceBuffer[currentSampleIndex + 1]

      outputSamples.push(
        leftSample + (rightSample - leftSample) * fractionalOffset,
      )
      this.sourcePosition += this.step
    }

    const consumedSampleCount = Math.floor(this.sourcePosition)

    if (consumedSampleCount > 0) {
      this.sourceBuffer = this.sourceBuffer.slice(consumedSampleCount)
      this.sourcePosition -= consumedSampleCount
    }

    return Float32Array.from(outputSamples)
  }

  reset(): void {
    this.sourceBuffer = new Float32Array(0)
    this.sourcePosition = 0
  }
}

const encodeInterleavedPcm16 = (
  interviewerSamples: Float32Array,
  userSamples: Float32Array,
): ArrayBuffer => {
  const interleavedSamples = new Int16Array(interviewerSamples.length * 2)

  for (let sampleIndex = 0; sampleIndex < interviewerSamples.length; sampleIndex += 1) {
    const interviewerSample = Math.max(-1, Math.min(1, interviewerSamples[sampleIndex] ?? 0))
    const userSample = Math.max(-1, Math.min(1, userSamples[sampleIndex] ?? 0))

    interleavedSamples[sampleIndex * 2] =
      interviewerSample < 0
        ? Math.round(interviewerSample * 0x8000)
        : Math.round(interviewerSample * 0x7fff)
    interleavedSamples[sampleIndex * 2 + 1] =
      userSample < 0 ? Math.round(userSample * 0x8000) : Math.round(userSample * 0x7fff)
  }

  return interleavedSamples.buffer
}

const buildAudioFrameMetadata = ({
  conversationId,
  sequence,
  streamId,
}: {
  conversationId: string
  sequence: number
  streamId: string
}): InterviewAudioFrameMetadata => {
  return {
    stream_id: streamId,
    conversation_id: conversationId,
    encoding: INTERVIEW_AUDIO_METADATA_DEFAULTS.encoding,
    sample_rate: INTERVIEW_AUDIO_METADATA_DEFAULTS.sampleRate,
    channels: INTERVIEW_AUDIO_METADATA_DEFAULTS.channels,
    sequence,
    timestamp_ms: Date.now(),
  }
}

const createSilentSink = (audioContext: AudioContext): GainNode => {
  const silentSink = audioContext.createGain()
  silentSink.gain.value = 0
  silentSink.connect(audioContext.destination)
  return silentSink
}

const createRoleProcessorNode = (
  audioContext: AudioContext,
  stream: MediaStream,
  silentSink: GainNode,
): {
  processorNode: AudioWorkletNode
  sourceNode: MediaStreamAudioSourceNode
} => {
  const sourceNode = audioContext.createMediaStreamSource(stream)
  const processorNode = new AudioWorkletNode(
    audioContext,
    INTERVIEW_AUDIO_WORKLET_PROCESSOR_NAME,
    {
      channelCount: 1,
      channelCountMode: "explicit",
      channelInterpretation: "speakers",
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [1],
    },
  )

  sourceNode.connect(processorNode)
  processorNode.connect(silentSink)

  return {
    processorNode,
    sourceNode,
  }
}

export const createInterviewAudioTransformEngine = async ({
  identifiers,
  interviewerStream,
  onDependencyLoss,
  userStream,
}: CreateAudioTransformEngineOptions): Promise<AudioTransformEngine> => {
  const audioContext = new AudioContext()
  const frameSampleCount = Math.round(
    INTERVIEW_AUDIO_METADATA_DEFAULTS.sampleRate *
      (INTERVIEW_AUDIO_METADATA_DEFAULTS.frameDurationMs / 1000),
  )
  let emitFrame: InterviewFrameEmitter | null = null
  let isStreaming = false
  let sequence = 0

  await audioContext.audioWorklet.addModule(INTERVIEW_AUDIO_WORKLET_MODULE_PATH)

  const silentSink = createSilentSink(audioContext)
  const interviewerGraph = createRoleProcessorNode(
    audioContext,
    interviewerStream,
    silentSink,
  )
  const userGraph = createRoleProcessorNode(audioContext, userStream, silentSink)
  const interviewerResampler = new StreamingResampler(
    audioContext.sampleRate,
    INTERVIEW_AUDIO_METADATA_DEFAULTS.sampleRate,
  )
  const userResampler = new StreamingResampler(
    audioContext.sampleRate,
    INTERVIEW_AUDIO_METADATA_DEFAULTS.sampleRate,
  )
  const interviewerQueue = new Float32SampleQueue()
  const userQueue = new Float32SampleQueue()

  const flushQueuedFrames = async (): Promise<void> => {
    if (!emitFrame || !isStreaming) {
      return
    }

    while (
      interviewerQueue.length >= frameSampleCount &&
      userQueue.length >= frameSampleCount
    ) {
      const frame: InterviewAudioFrame = {
        metadata: buildAudioFrameMetadata({
          conversationId: identifiers.conversationId,
          sequence,
          streamId: identifiers.streamId,
        }),
        payload: encodeInterleavedPcm16(
          interviewerQueue.dequeue(frameSampleCount),
          userQueue.dequeue(frameSampleCount),
        ),
      }

      sequence += 1
      await Promise.resolve(emitFrame(frame))
    }
  }

  const bindProcessorPort = (
    role: AudioTransformEngineRole,
    processorNode: AudioWorkletNode,
  ): void => {
    processorNode.port.onmessage = async (
      event: MessageEvent<AudioTransformWorkletMessage>,
    ) => {
      if (!event.data.buffer || !isStreaming) {
        return
      }

      const rawSamples = new Float32Array(event.data.buffer)
      const resampledSamples =
        role === "interviewer"
          ? interviewerResampler.push(rawSamples)
          : userResampler.push(rawSamples)

      if (role === "interviewer") {
        interviewerQueue.enqueue(resampledSamples)
      } else {
        userQueue.enqueue(resampledSamples)
      }

      await flushQueuedFrames()
    }
  }

  bindProcessorPort("interviewer", interviewerGraph.processorNode)
  bindProcessorPort("user", userGraph.processorNode)

  const handleContextStateChange = (): void => {
    if (!isStreaming) {
      return
    }

    if (audioContext.state === "closed") {
      onDependencyLoss(
        buildInterviewMediaError(
          "audio_context_closed",
          "The interview audio pipeline closed unexpectedly during the active session.",
          "runtime",
        ),
      )
    }
  }

  audioContext.addEventListener("statechange", handleContextStateChange)
  await audioContext.suspend()

  return {
    start: async (nextEmitFrame) => {
      emitFrame = nextEmitFrame
      isStreaming = true
      sequence = 0
      interviewerQueue.clear()
      userQueue.clear()
      interviewerResampler.reset()
      userResampler.reset()
      await audioContext.resume()
    },
    stop: async () => {
      isStreaming = false
      emitFrame = null
      interviewerQueue.clear()
      userQueue.clear()
      interviewerResampler.reset()
      userResampler.reset()

      if (audioContext.state === "running") {
        await audioContext.suspend()
      }
    },
    teardown: async () => {
      isStreaming = false
      emitFrame = null
      interviewerQueue.clear()
      userQueue.clear()
      interviewerResampler.reset()
      userResampler.reset()
      audioContext.removeEventListener("statechange", handleContextStateChange)
      interviewerGraph.processorNode.port.onmessage = null
      userGraph.processorNode.port.onmessage = null
      interviewerGraph.sourceNode.disconnect()
      interviewerGraph.processorNode.disconnect()
      userGraph.sourceNode.disconnect()
      userGraph.processorNode.disconnect()
      silentSink.disconnect()

      if (audioContext.state !== "closed") {
        await audioContext.close()
      }
    },
  }
}

export type { AudioTransformEngine, CreateAudioTransformEngineOptions }
