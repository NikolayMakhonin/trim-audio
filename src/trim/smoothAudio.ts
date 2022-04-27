export function smoothAudio({
  samplesData,
  channelsCount,
  startSamples,
  endSamples,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  startSamples: number,
  endSamples: number,
}) {
  if (!startSamples && !endSamples) {
    return
  }
  if (!startSamples) {
    startSamples = 0
  }
  if (!endSamples) {
    endSamples = 0
  }

  const samplesCount = Math.floor(samplesData.length / channelsCount)
  if (startSamples + endSamples > samplesCount) {
    const mult = samplesCount / (startSamples + endSamples)
    startSamples *= mult
    endSamples *= mult
  }

  if (startSamples) {
    for (let i = 0; i < startSamples; i++) {
      const mult = i / startSamples
      for (let channel = 0; channel < channelsCount; channel++) {
        samplesData[i * channelsCount + channel] *= mult
      }
    }
  }
  if (endSamples) {
    for (let i = 0; i < endSamples; i++) {
      const mult = i / endSamples
      for (let channel = 0; channel < channelsCount; channel++) {
        samplesData[(samplesCount - 1 - i) * channelsCount + channel] *= mult
      }
    }
  }
}
