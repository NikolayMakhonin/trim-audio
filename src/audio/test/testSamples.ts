/* eslint-disable @typescript-eslint/no-shadow */
import {checkSamples} from './checkSamples'
import {generateSamples, SamplesPattern} from './generateSamples'

export function testSamples({
  samplesCount,
  channelsCount,
  fillData,
  handle,
  maxDiff,
}: {
  samplesCount: number,
  channelsCount: number,
  fillData: (
    samplesDataActual: Float32Array, samplesDataExpect: Float32Array,
    channelsCount: number, samplesCount: number,
  ) => void,
  handle: (samplesData: Float32Array, channelsCount: number, samplesCount: number) => void,
  maxDiff?: number,
}) {
  const samplesDataActual = new Float32Array(samplesCount * channelsCount)
  const samplesDataExpect = new Float32Array(samplesCount * channelsCount)

  fillData(samplesDataActual, samplesDataExpect, channelsCount, samplesCount)

  handle(samplesDataActual, channelsCount, samplesCount)

  checkSamples({
    actual: {
      samplesData: samplesDataActual,
      channelsCount,
    },
    expect: {
      samplesData: samplesDataExpect,
      channelsCount,
    },
    maxDiff,
  })
}

export function testSamplesWithPatterns({
  samplesCount,
  channelsCount,
  maxDiff,
  patternsActual,
  patternsExpected,
  handle,
}: {
  samplesCount: number,
  channelsCount: number,
  maxDiff?: number,
  patternsActual: SamplesPattern[][],
  patternsExpected: SamplesPattern[][],
  handle: (samplesData: Float32Array, channelsCount: number, samplesCount: number) => void,
}) {
  return testSamples({
    samplesCount,
    channelsCount,
    maxDiff,
    fillData(
      samplesDataActual,
      samplesDataExpect,
      channelsCount,
      samplesCount,
    ) {
      generateSamples({
        samplesData: samplesDataActual,
        channelsCount,
        patterns   : patternsActual,
      })
      generateSamples({
        samplesData: samplesDataExpect,
        channelsCount,
        patterns   : patternsExpected,
      })
    },
    handle,
  })
}
