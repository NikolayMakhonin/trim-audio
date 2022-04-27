/* eslint-disable no-self-compare */
// noinspection PointlessBooleanExpressionJS

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

// normalize(samples, 0.95)
// samples = await trimSamples({
//     samples,
//     silenceLevelStart,
//     silenceLevelEnd,
//     minSilenceSamples: Math.round(40 / 1000 * 16000), // 40 ms
// })
