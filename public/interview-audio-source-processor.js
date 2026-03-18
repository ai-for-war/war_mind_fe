class InterviewSourceProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const inputChannels = inputs[0]

    if (!inputChannels || inputChannels.length === 0) {
      return true
    }

    const frameCount = inputChannels[0]?.length ?? 0

    if (frameCount === 0) {
      return true
    }

    const monoSamples = new Float32Array(frameCount)

    if (inputChannels.length === 1) {
      monoSamples.set(inputChannels[0])
    } else {
      for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
        let mixedSample = 0

        for (let channelIndex = 0; channelIndex < inputChannels.length; channelIndex += 1) {
          mixedSample += inputChannels[channelIndex][frameIndex] ?? 0
        }

        monoSamples[frameIndex] = mixedSample / inputChannels.length
      }
    }

    this.port.postMessage(
      {
        buffer: monoSamples.buffer,
      },
      [monoSamples.buffer],
    )

    return true
  }
}

registerProcessor("interview-source-processor", InterviewSourceProcessor)

