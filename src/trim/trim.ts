import {AudioSamples} from './contracts'
import erfcinv from '@stdlib/math-base-special-erfcinv'

export const SILENCE_LEVEL_START_DEFAULT = -1.1 // use -1.5 for 'ф..'
export const SILENCE_LEVEL_END_DEFAULT = -2

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

function correctSample(value: number) {
  if (typeof value !== 'number' || (value === value) === false) {
    throw new Error('value is NaN')
  }
  if (value > 1) {
    value = 1
  }
  if (value < -1) {
    value = -1
  }
  return value
}

export function multAmplitude({
  samples,
  mult,
}: {
  samples: AudioSamples,
  mult: number,
}) {
  const len = Math.floor(samples.data.length / samples.channels)
  for (let i = 0; i < len; i++) {
    samples.data[i] *= mult
  }
}

export function normalizeOffsetWithWindow({
  samples,
  windowSamples,
}: {
  samples: AudioSamples,
  windowSamples,
}) {
  const windowSamplesHalf = Math.ceil(windowSamples / 2)
  const window = new Float32Array(windowSamplesHalf)
  let windowIndex = 0

  const channels = samples.channels
  const len = Math.floor(samples.data.length / channels)
  let max = 0
  let sum = 0
  for (let i = 0; i < len; i++) {
    const value = samples.data[i * channels + 0]
    samples.data[i * channels + 1] = value
    sum += value
    const valueAbs = Math.abs(value)
    if (valueAbs > max) {
      max = valueAbs
    }
    if (windowSamples && i >= windowSamples) {
      if (i > windowSamples) {
        samples.data[(i - windowSamples - 1) * channels + 0] = correctSample(window[windowIndex])
      }

      const prevValue = samples.data[(i - windowSamples) * channels + 0]
      const middleValue = samples.data[(i - windowSamples + windowSamplesHalf) * channels + 0]

      const avg = sum / windowSamples
      sum -= prevValue
      const offset = -avg

      if (i === windowSamples) {
        for (let j = 0; j < windowSamples; j++) {
          window[j] = correctSample((samples.data[j * channels + 0] + offset))
        }
      } else if (i === len - 1) {
        for (let j = len - windowSamples; j < len; j++) {
          samples.data[j * channels + 0] = correctSample((samples.data[j * channels + 0] + offset))
        }
      } else {
        window[windowIndex] = correctSample((middleValue + offset))
        windowIndex++
        if (windowIndex >= windowSamplesHalf) {
          windowIndex = 0
        }
      }
    }
  }

  return max
}

export function normalizeAmplitudeWithWindow({
  samples,
  coef,
  windowSamples,
}: {
  samples: AudioSamples,
  coef: number,
  windowSamples,
}) {
  const EPSILON = 1e-16
  const windowSamplesHalf = Math.ceil(windowSamples / 2)
  const windowSamples2 = windowSamples * 2

  const channels = samples.channels
  const len = Math.floor(samples.data.length / channels)
  let maxPrev = 0
  let max = 0
  let maxNext = 0

  function _normalize(i: number) {
    let maxJ = Math.min(windowSamplesHalf, len - i + windowSamples2)
    for (let j = 0; j < maxJ; j++) {
      const _max = maxPrev > max ? maxPrev + (max - maxPrev) * j / windowSamplesHalf : max
      const mult = _max < EPSILON ? 1 : coef / _max
      const index = (i - windowSamples2 + j) * channels
      const value = samples.data[index]
      samples.data[index] = correctSample(value * mult)
      samples.data[index + 1] = _max
    }
    const _windowSamplesHalf = windowSamples - windowSamplesHalf
    maxJ = Math.min(_windowSamplesHalf, len - i + windowSamples2 - windowSamplesHalf)
    for (let j = 0; j < maxJ; j++) {
      const _max = maxNext > max ? max + (maxNext - max) * j / _windowSamplesHalf : max
      const mult = _max < EPSILON ? 1 : coef / _max
      const index = (i - windowSamples2 + j + windowSamplesHalf) * channels
      const value = samples.data[index]
      samples.data[index] = correctSample(value * mult)
      samples.data[index + 1] = _max
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
    const indexNext = i * channels
    const valueNext = samples.data[indexNext]
    samples.data[indexNext + 1] = valueNext
    const valueNextAbs = Math.abs(valueNext)
    if (valueNextAbs > maxNext) {
      maxNext = valueNextAbs
    }
  }

  const i = Math.ceil(len / windowSamples) * windowSamples
  _normalize(i)
  maxPrev = max
  max = maxNext
  maxNext = 0
  _normalize(i + windowSamples)
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
//         ]
//
//       sum += value
//       sumSqr += value * value
//       if (i >= minSilenceSamples) {
//         const prevValue = samples[
//           backward
//             ? len - (i - minSilenceSamples) - 1
//             : i - minSilenceSamples
//           ]
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
