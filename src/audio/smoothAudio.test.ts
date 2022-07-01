/* eslint-disable @typescript-eslint/no-shadow */
import {SamplesPattern} from './test/generateSamples'
import {testSamplesWithPatterns} from './test/testSamples'
import {mapChannels} from './test/mapChannels'
import {smoothAudio} from './smoothAudio'
import {createTestVariants} from "@flemist/test-variants";

describe('audio > smoothAudio', function () {
  this.timeout(30000)

  const testVariants = createTestVariants(({
    samplesCount,
    channelsCount,
    channels,
    startSamples,
    endSamples,
    patternsActual,
    patternsExpect,
  }: {
		samplesCount: number,
		channelsCount: number,
		channels: number[],
		startSamples: number,
		endSamples: number,
		patternsActual: SamplesPattern[][],
		patternsExpect: SamplesPattern[][],
	}) => {
    testSamplesWithPatterns({
      maxDiff: 1e-7,
      actual : {
        samplesCount,
        channelsCount,
        patterns: patternsActual,
      },
      expect: {
        samplesCount,
        channelsCount,
        patterns: patternsExpect,
      },
      handle(samplesData, channelsCount, samplesCount) {
        return smoothAudio({
          samplesData,
          channelsCount,
          channels,
          startSamples,
          endSamples,
        })
      },
    })
  })

  it('base', async function () {
    await testVariants({
      samplesCount : [100],
      channelsCount: [1, 2, 3],
      channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
        : channelsCount === 2 ? [[0, 1]]
          : [[0, 2], [1, 2], [0, 1, 2]],
      startSamples  : [0, 1, 10, 50],
      endSamples    : [0, 1, 10, 50],
      patternsActual: ({channelsCount, channels}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, 1],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, startSamples, endSamples}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, 1],
          ['fill', 0, startSamples, active ? -1 : 0, 0],
          ['fill', 100 - endSamples - 1, 99, 0, active ? -1 : 0],
          ['fill', 99, 100, active && endSamples > 0 ? -1 : 0],
        ]),
      ],
    })()
  })
})
