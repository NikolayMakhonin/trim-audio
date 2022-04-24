import {AudioSamples} from './contracts'
import erfinv from '@stdlib/math-base-special-erfinv'

export const SILENCE_LEVEL_START_DEFAULT = -1.1 // use -1.5 for 'ф..'
export const SILENCE_LEVEL_END_DEFAULT = -2

function calcDelta(count, sum, sumSqr, probability) {
  // const avg = sum / count
  // const dispersion = (sumSqr / count - avg * avg) * count / (count - 1)
  const dispersion = (sumSqr - sum * sum / count) / (count - 1)
  const standardDeviation = Math.sqrt(dispersion)

  // F(x) = 1 + erf((x - avg) / (standardDeviation * (2 ** 0.5)))
  // 1 - F(x) = erf
  // erfinv(1 - F(x)) = (x - avg) / (standardDeviation * (2 ** 0.5))
  // x - avg = erfinv(1 - F(x)) * standardDeviation * (2 ** 0.5)
  // x = erfinv(1 - F(x)) * standardDeviation * (2 ** 0.5) + avg
  // deltaSD = erfinv(1 - F(x)) * (2 ** 0.5)
  // deltaSD = erfcinv(noiseLevel) * (2 ** 0.5)
  const delta = erfinv(probability) * (2 ** 0.5) * standardDeviation
  return delta
}

export function normalizeSimple({
  samples,
  coef,
  maxNoiseRelativeSamples,
}: {
  samples: AudioSamples,
  coef: number,
  maxNoiseRelativeSamples: number,
}) {
  const len = samples.data.length
  let max = 0
  let min = 1
  let sum = 0
  let sumSqr = 0
  for (let i = 0; i < len; i++) {
    const value = samples.data[i]
    if (value > max) {
      max = value
    }
    if (value < min) {
      min = value
    }
    sum += value
    sumSqr += value * value
  }

  const avg = sum / len
  if (len > 30 && maxNoiseRelativeSamples && maxNoiseRelativeSamples < 1) {
    const delta = calcDelta(len, sum, sumSqr, 1 - maxNoiseRelativeSamples)
    const statMin = avg - delta
    const statMax = avg + delta
    if (statMin > min) {
      min = statMin
    }
    if (statMax < max) {
      max = statMax
    }
  }

  const offset = -avg
  const mult = coef / Math.max(max + offset, -(min + offset))
  for (let i = 0; i < len; i++) {
    samples.data[i] = (samples.data[i] + offset) * mult
  }
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

export function normalizeWithWindow({
  samples,
  coef,
  maxNoiseRelativeSamples,
  windowSamples,
}: {
  samples: AudioSamples,
  coef: number,
  maxNoiseRelativeSamples: number,
  windowSamples,
}) {
  const windowSamplesHalf = Math.ceil(windowSamples / 2)
  const window = new Float32Array(windowSamplesHalf)
  let windowIndex = 0

  const channels = samples.channels
  const len = Math.floor(samples.data.length / channels)
  let max = 0
  let min = 1
  let sum = 0
  let sumSqr = 0
  for (let i = 0; i < len; i++) {
    const value = samples.data[i * channels + 0]
    if (value > max) {
      max = value
    }
    if (value < min) {
      min = value
    }
    sum += value
    sumSqr += value * value
    if (windowSamples && i >= windowSamples) {
      if (i > windowSamples) {
        samples.data[(i - windowSamples - 1) * channels + 0] = correctSample(window[windowIndex])
      }

      const prevValue = samples.data[(i - windowSamples) * channels + 0]
      const middleValue = samples.data[(i - windowSamples + windowSamplesHalf) * channels + 0]

      const avg = sum / windowSamples
      sum -= prevValue
      sumSqr -= prevValue * prevValue
      const delta = calcDelta(windowSamples, sum, sumSqr, 1 - maxNoiseRelativeSamples)
      const offset = -avg
      const mult = delta === 0 ? 1 : coef / delta

      if (i === windowSamples) {
        for (let j = 0; j < windowSamples; j++) {
          window[j] = correctSample((samples.data[j * channels + 0] + offset) * mult)
        }
      } else if (i === len - 1) {
        for (let j = len - windowSamples; j < len; j++) {
          samples.data[j * channels + 0] = correctSample((samples.data[j * channels + 0] + offset) * mult)
        }
      } else {
        window[windowIndex] = correctSample((middleValue + offset) * mult)
        windowIndex++
        if (windowIndex >= windowSamplesHalf) {
          windowIndex = 0
        }
      }
    }
  }
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
