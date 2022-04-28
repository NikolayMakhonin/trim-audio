import {checkSamples} from './checkSamples'

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
