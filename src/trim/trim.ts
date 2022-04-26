/* eslint-disable no-self-compare */
// noinspection PointlessBooleanExpressionJS

import erfcinv from '@stdlib/math-base-special-erfcinv'

export const SILENCE_LEVEL_START_DEFAULT = -1.1 // use -1.5 for 'ф..'
export const SILENCE_LEVEL_END_DEFAULT = -2
export const EPSILON = 1e-16

function calcStandardDeviation(count: number, sum: number, sumSqr: number) {
  const avg = sum / count
  const dispersion = (sumSqr / count - avg * avg) * count / (count - 1)
  // const dispersion = (sumSqr - sum * sum / count) / (count - 1)
  const standardDeviation = Math.sqrt(dispersion)

  return standardDeviation
}

function calcDelta(outsideProbability: number) {
  // F(x) = 1 + erf((x - avg) / (standardDeviation * (2 ** 0.5)))
  // 1 - F(x) = erf
  // erfinv(1 - F(x)) = (x - avg) / (standardDeviation * (2 ** 0.5))
  // x - avg = erfinv(1 - F(x)) * standardDeviation * (2 ** 0.5)
  // x = erfinv(1 - F(x)) * standardDeviation * (2 ** 0.5) + avg
  // deltaSD = erfinv(1 - F(x)) * (2 ** 0.5)
  // deltaSD = erfcinv(noiseLevel) * (2 ** 0.5)
  const delta = erfcinv(outsideProbability) * (2 ** 0.5)
  return delta
}

function checkIsNumber(value: number) {
  if (typeof value !== 'number' || (value === value) === false) {
    throw new Error('value === ' + value)
  }
  return value
}

function correctSample(value: number) {
  value = checkIsNumber(value)
  if (value > 1) {
    throw new Error('value === ' + value)
    // value = 1
  }
  if (value < -1) {
    throw new Error('value === ' + value)
    // value = -1
  }
  return value
}

function generateIndexArray(length: number): number[] {
  const array = []
  for (let i = 0; i < length; i++) {
    array[i] = i
  }
  return array
}

function getMaxAmplitude({
  samplesData,
  channelsCount,
  channels,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
}) {
  if (channels == null) {
    channels = generateIndexArray(channelsCount)
  }

  const channelsLength = channels.length
  if (channelsLength === 0) {
    return 0
  }

  const samplesCount = Math.floor(samplesData.length / channelsCount)
  
  let max = 0
  for (let i = 0; i < samplesCount; i++) {
    const index = i * channelsCount
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
      const channel = channels[nChannel]
      const value = samplesData[index + channel]
      const valueAbs = Math.abs(value)
      if (valueAbs > max) {
        max = valueAbs
      }
    }
  }

  return max
}

function multAmplitude({
  samplesData,
  channelsCount,
  channels,
  mult,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
  mult: number,
}) {
  if (channels == null) {
    channels = generateIndexArray(channelsCount)
  }

  const channelsLength = channels.length
  if (channelsLength === 0) {
    return
  }

  const samplesCount = Math.floor(samplesData.length / channelsCount)
  for (let i = 0; i < samplesCount; i++) {
    const index = i * channelsCount
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
      const channel = channels[nChannel]
      const value = samplesData[index + channel]
      samplesData[index + channel] = correctSample(value * mult)
    }
  }
}

function _normalizeAmplitudeSimple({
  samplesData,
  channelsCount,
  channels,
  coef,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
  coef: number,
}) {
  const max = getMaxAmplitude({
    samplesData,
    channelsCount,
    channels,
  })
  if (max > EPSILON) {
    multAmplitude({
      samplesData,
      channelsCount,
      channels,
      mult: coef / max,
    })
  }
}

export function normalizeAmplitudeSimple({
  samplesData,
  channelsCount,
  channels,
  separateChannels,
  coef,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
  separateChannels?: boolean,
  coef: number,
}) {
  if (channels == null) {
    channels = generateIndexArray(channelsCount)
  }

  const channelsLength = channels.length
  if (channelsLength === 0) {
    return
  }

  if (separateChannels) {
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
      _normalizeAmplitudeSimple({
        samplesData,
        channelsCount,
        channels: [channels[nChannel]],
        coef,
      })
    }
    return
  }

  _normalizeAmplitudeSimple({
    samplesData,
    channelsCount,
    channels,
    coef,
  })
}

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

function _normalizeAmplitudeWithWindow({
  samplesData,
  channelsCount,
  channels,
  coef,
  windowSamples,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
  coef: number,
  windowSamples: number,
}) {
  const windowSamplesHalf = Math.ceil(windowSamples / 2)
  const windowSamples2 = windowSamples * 2

  if (channels == null) {
    channels = generateIndexArray(channelsCount)
  }

  const channelsLength = channels.length
  if (channelsLength === 0) {
    return
  }

  const samplesCount = Math.floor(samplesData.length / channelsCount)
  let maxPrev = 0
  let max = 0
  let maxNext = 0

  function _normalize(i: number) {
    let maxJ = Math.min(windowSamplesHalf, samplesCount - i + windowSamples2)
    for (let j = 0; j < maxJ; j++) {
      const _max = maxPrev > max ? maxPrev + (max - maxPrev) * j / windowSamplesHalf : max
      const mult = _max < EPSILON ? 1 : coef / _max
      const index = (i - windowSamples2 + j) * channelsCount
      for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
        const channel = channels[nChannel]
        const value = samplesData[index + channel]
        samplesData[index + channel] = (value * mult)
      }
    }
    const _windowSamplesHalf = windowSamples - windowSamplesHalf
    maxJ = Math.min(_windowSamplesHalf, samplesCount - i + windowSamples2 - windowSamplesHalf)
    for (let j = 0; j < maxJ; j++) {
      const _max = maxNext > max ? max + (maxNext - max) * j / _windowSamplesHalf : max
      const mult = _max < EPSILON ? 1 : coef / _max
      const index = (i - windowSamples2 + j + windowSamplesHalf) * channelsCount
      for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
        const channel = channels[nChannel]
        const value = samplesData[index + channel]
        samplesData[index + channel] = correctSample(value * mult)
      }
    }
  }

  for (let i = 0; i < samplesCount; i++) {
    if (i >= windowSamples2 && i % windowSamples === 0) {
      _normalize(i)
    }
    if (i % windowSamples === 0) {
      maxPrev = max
      max = maxNext
      maxNext = 0
    }
    const index = i * channelsCount
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
      const channel = channels[nChannel]
      const valueNext = samplesData[index + channel]
      const valueNextAbs = Math.abs(valueNext)
      if (valueNextAbs > maxNext) {
        maxNext = valueNextAbs
      }
    }
  }

  const i = Math.ceil(samplesCount / windowSamples) * windowSamples
  _normalize(i)
  maxPrev = max
  max = maxNext
  maxNext = 0
  _normalize(i + windowSamples)
}

export function normalizeAmplitudeWithWindow({
  samplesData,
  channelsCount,
  channels,
  separateChannels,
  coef,
  windowSamples,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
  separateChannels?: boolean,
  coef: number,
  windowSamples: number,
}) {
  if (channels == null) {
    channels = generateIndexArray(channelsCount)
  }

  const channelsLength = channels.length
  if (channelsLength === 0) {
    return
  }

  if (separateChannels) {
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
      _normalizeAmplitudeWithWindow({
        samplesData,
        channelsCount,
        channels: [channels[nChannel]],
        coef,
        windowSamples,
      })
    }
    return
  }

  _normalizeAmplitudeWithWindow({
    samplesData,
    channelsCount,
    channels,
    coef,
    windowSamples,
  })
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

  // Amplify
  // if (from != null) {
  //   for (let i = 0; i < minSilenceSamples; i++) {
  //     samples[i] *= (i / minSilenceSamples)
  //   }
  // }
  // if (to != null) {
  //   for (let i = 0; i < minSilenceSamples; i++) {
  //     samples[len - i - 1] *= (i / minSilenceSamples)
  //   }
  // }
}

// normalize(samples, 0.95)
// samples = await trimSamples({
//     samples,
//     silenceLevelStart,
//     silenceLevelEnd,
//     minSilenceSamples: Math.round(40 / 1000 * 16000), // 40 ms
// })
