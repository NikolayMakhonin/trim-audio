/* eslint-disable @typescript-eslint/no-shadow */
import {normalizeOffsetSimple, NormalizeOffsetSimpleArgs} from './normalizeOffsetSimple'
import {SamplesPattern} from './test/generateSamples'
import {testSamplesWithPatterns} from './test/testSamples'
import {mapChannels} from './test/mapChannels'
import {createTestVariants} from '@flemist/test-variants'
import {audioClient} from 'src/audio/test/audioClient'

describe('audio > normalizeOffsetSimple', function () {
  this.timeout(30000)

  after(async () => {
    audioClient.terminate()
  })

  const testVariants = createTestVariants(({
    useWorker,
    samplesCount,
    channelsCount,
    channels,
    patternsActual,
    patternsExpect,
  }: {
    useWorker: boolean,
		samplesCount: number,
		channelsCount: number,
		channels: number[],
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
      async handle(samplesData, channelsCount, samplesCount) {
        const args: NormalizeOffsetSimpleArgs = {
          samplesData,
          channelsCount,
          channels,
        }

        if (useWorker) {
          const data = await audioClient.normalizeOffsetSimple(args)
          return data.data
        }
        else {
          normalizeOffsetSimple(args)
        }
      },
    })
  })

  it('silence 0', async function () {
    await testVariants({
      useWorker    : [false, true],
      samplesCount : [100],
      channelsCount: [1, 2, 3],
      channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
        : channelsCount === 2 ? [[0, 1]]
          : [[0, 2], [1, 2], [0, 1, 2]],
      amplitude     : [0, 1, 0.5, -1, -0.25],
      patternsActual: ({channelsCount, channels, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 1, active ? 0 : amplitude],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 1, active ? 0 : amplitude],
        ]),
      ],
    })()
  })

  it('silence 1', async function () {
    await testVariants({
      useWorker    : [false, true],
      samplesCount : [100],
      channelsCount: [1, 2, 3],
      channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
        : channelsCount === 2 ? [[0, 1]]
          : [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
      amplitude     : [0, 1, 0.5, -1, -0.25],
      patternsActual: ({channelsCount, channels, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.2 * amplitude : 0.1],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0 : 0.1],
        ]),
      ],
    })()
  })

  it('peak', async function () {
    await testVariants({
      useWorker    : [false, true],
      samplesCount : [100],
      channelsCount: [1, 2, 3],
      channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
        : channelsCount === 2 ? [[0, 1]]
          : [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
      position      : [0, 73, 99],
      amplitude     : [0, 1, 0.5, -1, -0.25],
      patternsActual: ({channelsCount, channels, position, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
          ['fill', position, position + 1, active ? 0.1 * amplitude : 0],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, position, amplitude, samplesCount}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
          ['fill', position, position + 1, active ? 0.1 * amplitude : 0],
          ['fill', 0, 100, active ? -(0.1 + 0.1 * samplesCount) / samplesCount * amplitude : 0],
        ]),
      ],
    })()
  })
})
