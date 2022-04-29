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
      if (windowSamples && i >= windowSamples - 1) {
        if (i >= windowSamples) {
          const prevValue = samplesData[(i - windowSamples) * channelsCount + channel]
          sum -= prevValue
          samplesData[(i - windowSamples) * channelsCount + channel] = checkIsNumber(window[windowIndex])
        }

        const avg = sum / windowSamples
        const offset = -avg

        if (i === windowSamples - 1) {
          for (let j = 0; j < windowSamplesHalf; j++) {
            window[j] = checkIsNumber((samplesData[j * channelsCount + channel] + offset))
          }
        } else {
          const middleValue = samplesData[(i - windowSamples + windowSamplesHalf) * channelsCount + channel]
          window[windowIndex] = checkIsNumber((middleValue + offset))
          windowIndex++
          if (windowIndex >= windowSamplesHalf) {
            windowIndex = 0
          }
        }

        if (i === samplesCount - 1) {
          for (let j = 0; j < windowSamplesHalf; j++) {
            samplesData[(samplesCount - windowSamples + j) * channelsCount + channel] =
              checkIsNumber(window[windowIndex])
            windowIndex++
            if (windowIndex >= windowSamplesHalf) {
              windowIndex = 0
            }
          }
          for (let j = windowSamplesHalf; j < windowSamples; j++) {
            samplesData[(samplesCount - windowSamples + j) * channelsCount + channel] =
              checkIsNumber((samplesData[(samplesCount - windowSamples + j) * channelsCount + channel] + offset))
          }
        }
      }
    }
  }
}
