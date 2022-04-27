import {checkIsNumber, generateIndexArray} from './helpers'

export function normalizeOffsetWithWindow({
  samplesData,
  channelsCount,
  channels,
  windowSamples,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
  windowSamples: number,
}) {
  const windowSamplesHalf = Math.ceil(windowSamples / 2)
  const window = new Float32Array(windowSamplesHalf)
  let windowIndex = 0

  if (channels == null) {
    channels = generateIndexArray(channelsCount)
  }

  const channelsLength = channels.length
  if (channelsLength === 0) {
    return
  }

  const samplesCount = Math.floor(samplesData.length / channelsCount)

  for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
    const channel = channels[nChannel]

    let sum = 0
    for (let i = 0; i < samplesCount; i++) {
      const value = samplesData[i * channelsCount + channel]
      sum += value
      if (windowSamples && i >= windowSamples) {
        if (i > windowSamples) {
          samplesData[(i - windowSamples - 1) * channelsCount + channel] = checkIsNumber(window[windowIndex])
        }

        const prevValue = samplesData[(i - windowSamples) * channelsCount + channel]
        const middleValue = samplesData[(i - windowSamples + windowSamplesHalf) * channelsCount + channel]

        const avg = sum / windowSamples
        sum -= prevValue
        const offset = -avg

        if (i === windowSamples) {
          for (let j = 0; j < windowSamples; j++) {
            window[j] = checkIsNumber((samplesData[j * channelsCount + channel] + offset))
          }
        } else if (i === samplesCount - 1) {
          for (let j = samplesCount - windowSamples; j < samplesCount; j++) {
            samplesData[j * channelsCount + channel] =
              checkIsNumber((samplesData[j * channelsCount + channel] + offset))
          }
        } else {
          window[windowIndex] = checkIsNumber((middleValue + offset))
          windowIndex++
          if (windowIndex >= windowSamplesHalf) {
            windowIndex = 0
          }
        }
      }
    }
  }
}
