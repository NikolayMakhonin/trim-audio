import {AudioSamples} from '../contracts'
import {EPSILON} from '../helpers'

export function getFirstMaximum({
  getSample,
  windowSize,
  samplesCount,
}: {
  getSample: (index: number) => number,
  windowSize: number,
  samplesCount: number,
}) {
  let sum = 0
  let prevAvg
  let maximumStart
  let maximumEnd
  for (let i = 0; i < samplesCount; i++) {
    const sample = getSample(i)
    sum += Math.abs(sample)
    if (i >= windowSize) {
      const prevSample = getSample(i - windowSize)
      sum -= prevSample
    }
    if (i >= windowSize - 1) {
      const avg = sum / windowSize
      if (i === windowSize - 1 || avg > prevAvg) {
        prevAvg = avg
        maximumStart = i
      }
      else if (prevAvg > 0.1 && avg < prevAvg) {
        maximumEnd = i - 1
        break
      }
    }
  }

  if (prevAvg == null || maximumStart == null || maximumEnd == null) {
    throw new Error('Cannot find first maximum')
  }

  const index = Math.round((maximumEnd + maximumStart - windowSize) / 2)
  const value = getSample(index)

  return {
    index,
    value,
  }
}

export function checkSamples({
  actual,
  expect,
  maxDiff,
}: {
  actual: {
    samplesData: Float32Array,
    channelsCount: number,
  },
  expect: {
    samplesData: Float32Array,
    channelsCount: number,
  },
  maxDiff?: number,
}) {
  assert.strictEqual(expect.samplesData.length % expect.channelsCount, 0)
  assert.strictEqual(actual.channelsCount, expect.channelsCount)
  assert.strictEqual(actual.samplesData.length, expect.samplesData.length)
  const channelsCount = expect.channelsCount
  const samplesCount = expect.samplesData.length / expect.channelsCount

  if (!maxDiff) {
    maxDiff = EPSILON
  }

  for (let channel = 0; channel < channelsCount; channel++) {
    for (let i = 0; i < samplesCount; i++) {
      const index = i * channelsCount + channel
      const sampleActual = actual.samplesData[index]
      const sampleExpect = expect.samplesData[index]
      const diff = Math.abs(sampleExpect - sampleActual)
      if (diff > maxDiff) {
        throw new Error(`channel: ${channel}; index: ${i}; actual: ${sampleActual}; expect: ${sampleExpect}`)
      }
    }
  }
}
