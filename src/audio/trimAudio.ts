import {generateIndexArray} from './helpers'

// max dispersion of normalized audio = 1
// max decibel of normalized audio = 0

export function searchContent({
  samplesData,
  channelsCount,
  samplesCount,
  channels,
  windowSamples,
  backward,
  minContentSamples,
  minContentDispersion,
  maxSilenceSamples,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  samplesCount: number,
  channels?: number[],
  windowSamples: number,
  backward: boolean,
  minContentSamples: number,
  minContentDispersion: number,
  maxSilenceSamples: number,
}) {
  if (channels == null) {
    channels = generateIndexArray(channelsCount)
  }

  const channelsLength = channels.length
  if (channelsLength === 0) {
    return backward ? samplesCount - 1 : 0
  }

  let contentStartIndex = 0
  let contentStartEnd = 0

  let sum = 0
  let sumSqr = 0

  for (let i = 0; i < samplesCount; i++) {
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
      const channel = channels[nChannel]
      const index = (backward ? samplesCount - 1 - i : i) * channelsCount + channel
      const value = samplesData[index]
      sum += value
      sumSqr += value * value
    }
    if (i >= windowSamples) {
      for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
        const channel = channels[nChannel]
        const prevIndex = (
          backward
            ? samplesCount - 1 - (i - windowSamples)
            : (i - windowSamples)
        ) * channelsCount + channel
        const prevValue = samplesData[prevIndex]
        sum -= prevValue
        sumSqr -= prevValue * prevValue
      }

      const count = windowSamples * channelsLength
      const avg = sum / count
      const sqrAvg = sumSqr / count
      const dispersion = (sqrAvg - avg * avg) * count / (count - 1)

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
    return backward ? -1 : samplesCount
  }

  return backward
    ? samplesCount - 1 - contentStartIndex
    : contentStartIndex
}

export function trimAudio({
  samplesData,
  channelsCount,
  channels,
  start,
  end,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
  start?: {
    windowSamples: number,
    minContentSamples: number,
    minContentDispersion: number,
    maxSilenceSamples: number,
  },
  end?: {
    windowSamples: number,
    minContentSamples: number,
    minContentDispersion: number,
    maxSilenceSamples: number,
  },
}) {
  const samplesCount = Math.floor(samplesData.length / channelsCount)

  const trimStart = !start ? 0 : searchContent({
    samplesData,
    channelsCount,
    samplesCount,
    channels,
    windowSamples       : start.windowSamples,
    backward            : false,
    minContentSamples   : start.minContentSamples,
    minContentDispersion: start.minContentDispersion,
    maxSilenceSamples   : start.maxSilenceSamples,
  })

  const trimEnd = !end ? samplesCount - 1 : searchContent({
    samplesData,
    channelsCount,
    samplesCount        : Math.min(samplesCount, samplesCount - trimStart + start.windowSamples),
    channels,
    windowSamples       : start.windowSamples,
    backward            : true,
    minContentSamples   : end.minContentSamples,
    minContentDispersion: start.minContentDispersion,
    maxSilenceSamples   : end.maxSilenceSamples,
  })

  return trimStart >= trimEnd
    ? new Float32Array(0)
    : new Float32Array(
      samplesData.buffer,
      trimStart * channelsCount,
      trimEnd * channelsCount,
    )
}
