/* eslint-disable no-self-compare */
// noinspection PointlessBooleanExpressionJS

import {AudioSamples} from './contracts'
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
  samples,
  channels,
}: {
  samples: AudioSamples,
  channels?: number[],
}) {
  const channelsTotal = samples.channels

  if (channels == null) {
    channels = generateIndexArray(channelsTotal)
  }

  const channelsCount = channels.length
  if (channelsCount === 0) {
    return 0
  }

  const len = Math.floor(samples.data.length / channelsTotal)
  
  let max = 0
  for (let i = 0; i < len; i++) {
    const index = i * channelsTotal
    for (let nChannel = 0; nChannel < channelsCount; nChannel++) {
      const channel = channels[nChannel]
      const value = samples.data[index + channel]
      const valueAbs = Math.abs(value)
      if (valueAbs > max) {
        max = valueAbs
      }
    }
  }

  return max
}

function multAmplitude({
  samples,
  channels,
  mult,
}: {
  samples: AudioSamples,
  channels?: number[],
  mult: number,
}) {
  const channelsTotal = samples.channels

  if (channels == null) {
    channels = generateIndexArray(channelsTotal)
  }

  const channelsCount = channels.length
  if (channelsCount === 0) {
    return
  }

  const len = Math.floor(samples.data.length / channelsTotal)
  for (let i = 0; i < len; i++) {
    const index = i * channelsTotal
    for (let nChannel = 0; nChannel < channelsCount; nChannel++) {
      const channel = channels[nChannel]
      const value = samples.data[index + channel]
      samples.data[index + channel] = correctSample(value * mult)
    }
  }
}

function _normalizeAmplitudeSimple({
  samples,
  channels,
  coef,
}: {
  samples: AudioSamples,
  channels?: number[],
  coef: number,
}) {
  const max = getMaxAmplitude({samples, channels})
  if (max > EPSILON) {
    multAmplitude({
      samples,
      channels,
      mult: coef / max,
    })
  }
}

export function normalizeAmplitudeSimple({
  samples,
  channels,
  separateChannels,
  coef,
}: {
  samples: AudioSamples,
  channels?: number[],
  separateChannels?: boolean,
  coef: number,
}) {
  const channelsTotal = samples.channels

  if (channels == null) {
    channels = generateIndexArray(channelsTotal)
  }

  const channelsCount = channels.length
  if (channelsCount === 0) {
    return
  }

  if (separateChannels) {
    for (let nChannel = 0; nChannel < channelsCount; nChannel++) {
      _normalizeAmplitudeSimple({
        samples,
        channels: [channels[nChannel]],
        coef,
      })
    }
    return
  }

  _normalizeAmplitudeSimple({
    samples,
    channels,
    coef,
  })
}

export function normalizeOffsetWithWindow({
  samples,
  channels,
  windowSamples,
}: {
  samples: AudioSamples,
  channels?: number[],
  windowSamples: number,
}) {
  const windowSamplesHalf = Math.ceil(windowSamples / 2)
  const window = new Float32Array(windowSamplesHalf)
  let windowIndex = 0

  const channelsTotal = samples.channels

  if (channels == null) {
    channels = generateIndexArray(channelsTotal)
  }

  const channelsCount = channels.length
  if (channelsCount === 0) {
    return
  }

  const len = Math.floor(samples.data.length / channelsTotal)

  for (let nChannel = 0; nChannel < channelsCount; nChannel++) {
    const channel = channels[nChannel]

    let sum = 0
    for (let i = 0; i < len; i++) {
      const value = samples.data[i * channelsTotal + channel]
      sum += value
      if (windowSamples && i >= windowSamples) {
        if (i > windowSamples) {
          samples.data[(i - windowSamples - 1) * channelsTotal + channel] = checkIsNumber(window[windowIndex])
        }

        const prevValue = samples.data[(i - windowSamples) * channelsTotal + channel]
        const middleValue = samples.data[(i - windowSamples + windowSamplesHalf) * channelsTotal + channel]

        const avg = sum / windowSamples
        sum -= prevValue
        const offset = -avg

        if (i === windowSamples) {
          for (let j = 0; j < windowSamples; j++) {
            window[j] = checkIsNumber((samples.data[j * channelsTotal + channel] + offset))
          }
        } else if (i === len - 1) {
          for (let j = len - windowSamples; j < len; j++) {
            samples.data[j * channelsTotal + channel] =
              checkIsNumber((samples.data[j * channelsTotal + channel] + offset))
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
  samples,
  channels,
  coef,
  windowSamples,
}: {
  samples: AudioSamples,
  channels?: number[],
  coef: number,
  windowSamples: number,
}) {
  const windowSamplesHalf = Math.ceil(windowSamples / 2)
  const windowSamples2 = windowSamples * 2

  const channelsTotal = samples.channels

  if (channels == null) {
    channels = generateIndexArray(channelsTotal)
  }

  const channelsCount = channels.length
  if (channelsCount === 0) {
    return
  }

  const len = Math.floor(samples.data.length / channelsTotal)
  let maxPrev = 0
  let max = 0
  let maxNext = 0

  function _normalize(i: number) {
    let maxJ = Math.min(windowSamplesHalf, len - i + windowSamples2)
    for (let j = 0; j < maxJ; j++) {
      const _max = maxPrev > max ? maxPrev + (max - maxPrev) * j / windowSamplesHalf : max
      const mult = _max < EPSILON ? 1 : coef / _max
      const index = (i - windowSamples2 + j) * channelsTotal
      for (let nChannel = 0; nChannel < channelsCount; nChannel++) {
        const channel = channels[nChannel]
        const value = samples.data[index + channel]
        samples.data[index + channel] = (value * mult)
      }
    }
    const _windowSamplesHalf = windowSamples - windowSamplesHalf
    maxJ = Math.min(_windowSamplesHalf, len - i + windowSamples2 - windowSamplesHalf)
    for (let j = 0; j < maxJ; j++) {
      const _max = maxNext > max ? max + (maxNext - max) * j / _windowSamplesHalf : max
      const mult = _max < EPSILON ? 1 : coef / _max
      const index = (i - windowSamples2 + j + windowSamplesHalf) * channelsTotal
      for (let nChannel = 0; nChannel < channelsCount; nChannel++) {
        const channel = channels[nChannel]
        const value = samples.data[index + channel]
        samples.data[index + channel] = correctSample(value * mult)
      }
    }
  }

  for (let i = 0; i < len; i++) {
    if (i >= windowSamples2 && i % windowSamples === 0) {
      _normalize(i)
    }
    if (i % windowSamples === 0) {
      maxPrev = max
      max = maxNext
      maxNext = 0
    }
    const index = i * channelsTotal
    for (let nChannel = 0; nChannel < channelsCount; nChannel++) {
      const channel = channels[nChannel]
      const valueNext = samples.data[index + channel]
      const valueNextAbs = Math.abs(valueNext)
      if (valueNextAbs > maxNext) {
        maxNext = valueNextAbs
      }
    }
  }

  const i = Math.ceil(len / windowSamples) * windowSamples
  _normalize(i)
  maxPrev = max
  max = maxNext
  maxNext = 0
  _normalize(i + windowSamples)
}

export function normalizeAmplitudeWithWindow({
  samples,
  channels,
  separateChannels,
  coef,
  windowSamples,
}: {
  samples: AudioSamples,
  channels?: number[],
  separateChannels?: boolean,
  coef: number,
  windowSamples: number,
}) {
  const channelsTotal = samples.channels

  if (channels == null) {
    channels = generateIndexArray(channelsTotal)
  }

  const channelsCount = channels.length
  if (channelsCount === 0) {
    return
  }

  if (separateChannels) {
    for (let nChannel = 0; nChannel < channelsCount; nChannel++) {
      _normalizeAmplitudeWithWindow({
        samples,
        channels: [channels[nChannel]],
        coef,
        windowSamples,
      })
    }
    return
  }

  _normalizeAmplitudeWithWindow({
    samples,
    channels,
    coef,
    windowSamples,
  })
}

function searchContent(
  samplesData: Float32Array,
  samplesCount: number,
  channelsCount: number,
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
  samples,
  silenceLevelStart,
  silenceLevelEnd,
  minSilenceSamples,
  windowSamples,
  start,
  end,
}: {
  samples: AudioSamples,
  windowSamples: number,
  start: {
    minContentSamples: number,
    minContentDecibel: number,
    maxSilenceSamples: number,
  },
  end: {
    minContentSamples: number,
    minContentDecibel: number,
    maxSilenceSamples: number,
  },
}) {
  const channelsCount = samples.channels
  const samplesData = samples.data
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
    const trimStart = !start ? 0 : searchContent(
      samplesData,
      samplesCount,
      channelsCount,
      channel,
      windowSamples,
      false,
      start.minContentSamples,
      minContentDispersionStart,
      start.maxSilenceSamples,
    )

    const trimEnd = !end ? samplesCount - 1 : searchContent(
      samplesData,
      Math.min(samplesCount, samplesCount - trimStart + windowSamples),
      channelsCount,
      channel,
      windowSamples,
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

  samples.data = new Float32Array(
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

// export function trimSamples({
//   samples,
//   silenceLevelStart,
//   silenceLevelEnd,
//   minSilenceSamples,
// }: {
//   samples: AudioSamples,
//   silenceLevelStart: number,
//   silenceLevelEnd: number,
//   minSilenceSamples: number,
// }) {
//   if (silenceLevelStart == null) {
//     silenceLevelStart = SILENCE_LEVEL_START_DEFAULT
//   }
//   if (silenceLevelEnd == null) {
//     silenceLevelEnd = SILENCE_LEVEL_END_DEFAULT
//   }
//
//   let len = samples.data.length
//   const minDispersionStart = calcMinDispersion(silenceLevelStart)
//   const minDispersionEnd = calcMinDispersion(silenceLevelEnd)
//
//   function calcMinDispersion(silenceLevel: number) {
//     const result = 10 ** silenceLevel
//     return result * result
//   }
//
//   function searchContent(backward: boolean) {
//     let sum = 0
//     let sumSqr = 0
//
//     for (let i = 0; i < len; i++) {
//       const value = samples[
//         backward
//           ? len - i - 1
//           : i
//       ]
//
//       sum += value
//       sumSqr += value * value
//       if (i >= minSilenceSamples) {
//         const prevValue = samples[
//           backward
//             ? len - (i - minSilenceSamples) - 1
//             : i - minSilenceSamples
//         ]
//         sum -= prevValue
//         sumSqr -= prevValue * prevValue
//
//         const avg = sum / minSilenceSamples
//         const sqrAvg = sumSqr / minSilenceSamples
//         const dispersion = sqrAvg - avg * avg
//
//         if (dispersion > (backward ? minDispersionEnd : minDispersionStart)) {
//           return backward
//             ? len - (i - minSilenceSamples) - 1
//             : i - minSilenceSamples
//         }
//       }
//     }
//
//     return null
//   }
//
//   const from = searchContent(false)
//   if (from == null) {
//     throw new Error('Audio is empty')
//   }
//
//   const to = searchContent(true)
//
//   samples = samples.slice(from || 0, to || len)
//   len = samples.length
//
//   // Amplify
//   if (from != null) {
//     for (let i = 0; i < minSilenceSamples; i++) {
//       samples[i] *= (i / minSilenceSamples)
//     }
//   }
//   if (to != null) {
//     for (let i = 0; i < minSilenceSamples; i++) {
//       samples[len - i - 1] *= (i / minSilenceSamples)
//     }
//   }
//
//   return samples
// }

// normalize(samples, 0.95)
// samples = await trimSamples({
//     samples,
//     silenceLevelStart,
//     silenceLevelEnd,
//     minSilenceSamples: Math.round(40 / 1000 * 16000), // 40 ms
// })
