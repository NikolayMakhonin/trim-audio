/* eslint-disable @typescript-eslint/no-shadow */
import {createTestVariants} from '../../test/createTestVariants'
import {generateSamples, SamplesPattern} from './generateSamples'
import {testSamples} from './testSamples'

export const testVariants = createTestVariants(({
  samplesCount,
  channelsCount,
  patternsActual,
  patternsExpected,
  handle,
  maxDiff,
}: {
  samplesCount: number,
  channelsCount: number,
  patternsActual: SamplesPattern[][],
  patternsExpected: SamplesPattern[][],
  handle: (samplesData: Float32Array, channelsCount: number, samplesCount: number) => void,
  maxDiff: number,
}) => {
  testSamples({
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
})
