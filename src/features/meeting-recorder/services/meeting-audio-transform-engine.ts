import { MEETING_AUDIO_METADATA_DEFAULTS } from "@/features/meeting-recorder/constants"
import type {
  MeetingMediaPreparationOptions,
  PreparedMeetingMediaSession,
} from "@/features/meeting-recorder/services/meeting-session-controller"
import { buildMeetingMediaError } from "@/features/meeting-recorder/services/meeting-media-source-utils"
import type {
  MeetingAudioFrame,
  MeetingAudioFrameMetadata,
} from "@/features/meeting-recorder/types"

const MEETING_AUDIO_WORKLET_PROCESSOR_NAME = "meeting-source-processor"
const MEETING_AUDIO_WORKLET_MODULE_PATH = "/meeting-audio-source-processor.js"

type MeetingFrameEmitter = PreparedMeetingMediaSession["startStreaming"] extends (
  emitFrame: infer TEmitFrame,
) => Promise<void> | void
  ? TEmitFrame
  : never

type MeetingAudioTransformEngine = {
  start: (emitFrame: MeetingFrameEmitter) => Promise<void>
  stop: () => Promise<void>
  teardown: () => Promise<void>
}

type CreateMeetingAudioTransformEngineOptions = Pick<
  MeetingMediaPreparationOptions,
  "identifiers" | "onDependencyLoss"
> & {
  meetingTabStream: MediaStream
  microphoneStream: MediaStream
}

type MeetingAudioTransformWorkletMessage = {
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

  dequeue(sampleCount: number): Float32Array {
    const output = new Float32Array(sampleCount)
    let outputOffset = 0

    while (outputOffset < sampleCount && this.chunks.length > 0) {
      const currentChunk = this.chunks[0]
      const availableChunkLength = currentChunk.length - this.chunkOffset
      const copyLength = Math.min(sampleCount - outputOffset, availableChunkLength)

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

const encodeMonoPcm16 = (samples: Float32Array): ArrayBuffer => {
  const encodedSamples = new Int16Array(samples.length)

  for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
    const normalizedSample = Math.max(-1, Math.min(1, samples[sampleIndex] ?? 0))

    encodedSamples[sampleIndex] =
      normalizedSample < 0
        ? Math.round(normalizedSample * 0x8000)
        : Math.round(normalizedSample * 0x7fff)
  }

  return encodedSamples.buffer
}

const mixMonoSources = (
  meetingTabSamples: Float32Array,
  microphoneSamples: Float32Array,
): Float32Array => {
  const sampleCount = Math.min(meetingTabSamples.length, microphoneSamples.length)
  const mixedSamples = new Float32Array(sampleCount)

  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    mixedSamples[sampleIndex] =
      (meetingTabSamples[sampleIndex] + microphoneSamples[sampleIndex]) * 0.5
  }

  return mixedSamples
}

const buildAudioFrameMetadata = ({
  sequence,
  streamId,
}: {
  sequence: number
  streamId: string
}): MeetingAudioFrameMetadata => {
  return {
    stream_id: streamId,
    encoding: MEETING_AUDIO_METADATA_DEFAULTS.encoding,
    sample_rate: MEETING_AUDIO_METADATA_DEFAULTS.sampleRate,
    channels: MEETING_AUDIO_METADATA_DEFAULTS.channels,
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

const createSourceProcessorNode = (
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
    MEETING_AUDIO_WORKLET_PROCESSOR_NAME,
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

export const createMeetingAudioTransformEngine = async ({
  identifiers,
  meetingTabStream,
  microphoneStream,
  onDependencyLoss,
}: CreateMeetingAudioTransformEngineOptions): Promise<MeetingAudioTransformEngine> => {
  const audioContext = new AudioContext()
  const frameSampleCount = Math.round(
    MEETING_AUDIO_METADATA_DEFAULTS.sampleRate *
      (MEETING_AUDIO_METADATA_DEFAULTS.frameDurationMs / 1000),
  )
  let emitFrame: MeetingFrameEmitter | null = null
  let isStreaming = false
  let sequence = 0

  await audioContext.audioWorklet.addModule(MEETING_AUDIO_WORKLET_MODULE_PATH)

  const silentSink = createSilentSink(audioContext)
  const meetingTabGraph = createSourceProcessorNode(
    audioContext,
    meetingTabStream,
    silentSink,
  )
  const microphoneGraph = createSourceProcessorNode(
    audioContext,
    microphoneStream,
    silentSink,
  )
  const meetingTabQueue = new Float32SampleQueue()
  const microphoneQueue = new Float32SampleQueue()
  const outputQueue = new Float32SampleQueue()
  const resampler = new StreamingResampler(
    audioContext.sampleRate,
    MEETING_AUDIO_METADATA_DEFAULTS.sampleRate,
  )

  const flushQueuedFrames = async (): Promise<void> => {
    if (!emitFrame || !isStreaming) {
      return
    }

    while (outputQueue.length >= frameSampleCount) {
      const frame: MeetingAudioFrame = {
        metadata: buildAudioFrameMetadata({
          sequence,
          streamId: identifiers.streamId,
        }),
        payload: encodeMonoPcm16(outputQueue.dequeue(frameSampleCount)),
      }

      sequence += 1
      await Promise.resolve(emitFrame(frame))
    }
  }

  const flushMixedSamples = async (): Promise<void> => {
    if (!isStreaming) {
      return
    }

    while (meetingTabQueue.length > 0 && microphoneQueue.length > 0) {
      const mixableSampleCount = Math.min(
        meetingTabQueue.length,
        microphoneQueue.length,
      )

      const mixedSourceSamples = mixMonoSources(
        meetingTabQueue.dequeue(mixableSampleCount),
        microphoneQueue.dequeue(mixableSampleCount),
      )

      outputQueue.enqueue(resampler.push(mixedSourceSamples))
      await flushQueuedFrames()
    }
  }

  const bindProcessorPort = (
    queue: Float32SampleQueue,
    processorNode: AudioWorkletNode,
  ): void => {
    processorNode.port.onmessage = async (
      event: MessageEvent<MeetingAudioTransformWorkletMessage>,
    ) => {
      if (!event.data.buffer || !isStreaming) {
        return
      }

      queue.enqueue(new Float32Array(event.data.buffer))
      await flushMixedSamples()
    }
  }

  bindProcessorPort(meetingTabQueue, meetingTabGraph.processorNode)
  bindProcessorPort(microphoneQueue, microphoneGraph.processorNode)

  const handleContextStateChange = (): void => {
    if (!isStreaming) {
      return
    }

    if (audioContext.state === "closed") {
      onDependencyLoss(
        buildMeetingMediaError(
          "audio_context_closed",
          "The meeting audio pipeline closed unexpectedly during the active session.",
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
      meetingTabQueue.clear()
      microphoneQueue.clear()
      outputQueue.clear()
      resampler.reset()
      await audioContext.resume()
    },
    stop: async () => {
      isStreaming = false
      emitFrame = null
      meetingTabQueue.clear()
      microphoneQueue.clear()
      outputQueue.clear()
      resampler.reset()

      if (audioContext.state === "running") {
        await audioContext.suspend()
      }
    },
    teardown: async () => {
      isStreaming = false
      emitFrame = null
      meetingTabQueue.clear()
      microphoneQueue.clear()
      outputQueue.clear()
      resampler.reset()
      audioContext.removeEventListener("statechange", handleContextStateChange)
      meetingTabGraph.processorNode.port.onmessage = null
      microphoneGraph.processorNode.port.onmessage = null
      meetingTabGraph.sourceNode.disconnect()
      meetingTabGraph.processorNode.disconnect()
      microphoneGraph.sourceNode.disconnect()
      microphoneGraph.processorNode.disconnect()
      silentSink.disconnect()

      if (audioContext.state !== "closed") {
        await audioContext.close()
      }
    },
  }
}

export type {
  CreateMeetingAudioTransformEngineOptions,
  MeetingAudioTransformEngine,
}
