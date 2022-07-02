/* eslint-disable @typescript-eslint/no-shadow */
import {checkSamples} from './checkSamples'
import {generateSamples, SamplesPattern} from './generateSamples'

export async function testSamples({
  actual,
  expect,
  handle,
  maxDiff,
}: {
  actual: {
    samplesCount: number,
    channelsCount: number,
    fillData: (
      samplesData: Float32Array, channelsCount: number, samplesCount: number,
    ) => void,
  },
  expect: {
    samplesCount: number,
    channelsCount: number,
    fillData: (
      samplesData: Float32Array, channelsCount: number, samplesCount: number,
    ) => void,
  },
  handle: (
    samplesData: Float32Array,
    channelsCount: number,
    samplesCount: number,
  ) => Promise<Float32Array|void> | Float32Array|void,
  maxDiff?: number,
}) {
  const _actual = {
    samplesData  : new Float32Array(actual.samplesCount * actual.channelsCount),
    channelsCount: actual.channelsCount,
  }
  actual.fillData(_actual.samplesData, actual.channelsCount, actual.samplesCount)

  const _expect = {
    samplesData  : new Float32Array(expect.samplesCount * expect.channelsCount),
    channelsCount: expect.channelsCount,
  }
  expect.fillData(_expect.samplesData, expect.channelsCount, expect.samplesCount)

  const result = await handle(
    _actual.samplesData,
    _actual.channelsCount,
    actual.samplesCount,
  )

  if (result) {
    _actual.samplesData = result
  }

  checkSamples({
    actual: _actual,
    expect: _expect,
    maxDiff,
  })
}

export function testSamplesWithPatterns({
  actual,
  expect,
  maxDiff,
  handle,
}: {
  actual: {
    samplesCount: number,
    channelsCount: number,
    patterns: SamplesPattern[][],
  },
  expect: {
    samplesCount: number,
    channelsCount: number,
    patterns: SamplesPattern[][],
  },
  maxDiff?: number,
  handle: (
    samplesData: Float32Array,
    channelsCount: number,
    samplesCount: number,
  ) => Promise<Float32Array|void> | Float32Array|void,
}) {
  return testSamples({
    actual: {
      samplesCount : actual.samplesCount,
      channelsCount: actual.channelsCount,
      fillData(
        samplesData,
        channelsCount,
      ) {
        generateSamples({
          samplesData: samplesData,
          channelsCount,
          patterns   : actual.patterns,
        })
      },
    },
    expect: {
      samplesCount : expect.samplesCount,
      channelsCount: expect.channelsCount,
      fillData(
        samplesData,
        channelsCount,
      ) {
        generateSamples({
          samplesData,
          channelsCount,
          patterns: expect.patterns,
        })
      },
    },
    maxDiff,
    handle,
  })
}
