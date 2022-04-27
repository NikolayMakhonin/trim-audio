function _searchContent(
  samplesData: Float32Array,
  channelsCount: number,
  samplesCount: number,
  channel: number,
  windowSamples: number,
  backward: boolean,
  minContentSamples: number,
  minContentDispersion: number,
  maxSilenceSamples: number,
) {
  let contentStartIndex = 0
  let contentStartEnd = 0

  let sum = 0
  let sumSqr = 0

  for (let i = 0; i < samplesCount; i++) {
    const index = (backward ? samplesCount - 1 - i : i) * channelsCount + channel
    const value = samplesData[index]
    sum += value
    sumSqr += value * value
    if (i >= windowSamples) {
      const prevIndex = (
        backward
          ? samplesCount - 1 - (i - windowSamples)
          : (i - windowSamples)
      ) * channelsCount + channel
      const prevValue = samplesData[prevIndex]
      sum -= prevValue
      sumSqr -= prevValue * prevValue

      const avg = sum / windowSamples
      const sqrAvg = sumSqr / windowSamples
      const dispersion = (sqrAvg - avg * avg) * windowSamples / (windowSamples - 1)

      if (dispersion > minContentDispersion) {
        if (contentStartEnd === 0) {
          contentStartIndex = i - windowSamples
        }
        contentStartEnd = i
        if (i - contentStartIndex > minContentSamples) {
          return backward
            ? samplesCount - 1 - contentStartIndex
            : contentStartIndex
        }
      } else if (i - contentStartEnd > maxSilenceSamples) {
        contentStartEnd = 0
      }
    }
  }

  if (contentStartEnd === 0) {
    return backward ? samplesCount : 0
  }

  return backward
    ? samplesCount - 1 - contentStartIndex
    : contentStartIndex
}

export function searchContent({
  samplesData,
  channelsCount,
  samplesCount,
  channel,
  windowSamples,
  backward,
  minContentSamples,
  minContentDispersion,
  maxSilenceSamples,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  samplesCount: number,
  channel: number,
  windowSamples: number,
  backward: boolean,
  minContentSamples: number,
  minContentDispersion: number,
  maxSilenceSamples: number,
}) {
  return _searchContent(
    samplesData,
    channelsCount,
    samplesCount,
    channel,
    windowSamples,
    backward,
    minContentSamples,
    minContentDispersion,
    maxSilenceSamples,
  )
}

export function trimAudio({
  samplesData,
  channelsCount,
  start,
  end,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  start?: {
    windowSamples: number,
    minContentSamples: number,
    minContentDecibel: number,
    maxSilenceSamples: number,
  },
  end?: {
    windowSamples: number,
    minContentSamples: number,
    minContentDecibel: number,
    maxSilenceSamples: number,
  },
}) {
  const samplesCount = Math.floor(samplesData.length / channelsCount)

  function calcMinDispersion(silenceLevel: number) {
    const result = 10 ** silenceLevel
    return result * result
  }

  const minContentDispersionStart = start && calcMinDispersion(start.minContentDecibel)
  const minContentDispersionEnd = end && calcMinDispersion(end.minContentDecibel)

  let trimStartMin = 0
  let trimEndMax = samplesCount

  for (let channel = 0; channel < channelsCount; channel++) {
    const trimStart = !start ? 0 : _searchContent(
      samplesData,
      channelsCount,
      samplesCount,
      channel,
      start.windowSamples,
      false,
      start.minContentSamples,
      minContentDispersionStart,
      start.maxSilenceSamples,
    )

    const trimEnd = !end ? samplesCount - 1 : _searchContent(
      samplesData,
      channelsCount,
      Math.min(samplesCount, samplesCount - trimStart + start.windowSamples),
      channel,
      start.windowSamples,
      true,
      end.minContentSamples,
      minContentDispersionEnd,
      end.maxSilenceSamples,
    )

    if (trimStart < trimStartMin) {
      trimStartMin = trimStart
    }
    if (trimEnd > trimEndMax) {
      trimEndMax = trimEnd
    }
  }

  return trimStartMin >= trimEndMax
    ? new Float32Array(0)
    : new Float32Array(
      samplesData.buffer,
      trimStartMin * channelsCount,
      trimEndMax * channelsCount,
    )
}
