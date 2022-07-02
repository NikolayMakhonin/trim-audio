/* eslint-disable @typescript-eslint/no-shadow */
import {SamplesPattern} from './test/generateSamples'
import {testSamplesWithPatterns} from './test/testSamples'
import {mapChannels} from './test/mapChannels'
import {normalizeOffsetWithWindow, NormalizeOffsetWithWindowArgs} from './normalizeOffsetWithWindow'
import {createTestVariants} from '@flemist/test-variants'
import {audioClient} from 'src/audio/test/audioClient'

describe('audio > normalizeOffsetWithWindow', function () {
  this.timeout(30000)

  const testVariants = createTestVariants(({
    useWorker,
    samplesCount,
    channelsCount,
    channels,
    windowSamples,
    patternsActual,
    patternsExpect,
  }: {
    useWorker: boolean,
		samplesCount: number,
		channelsCount: number,
		channels: number[],
		windowSamples: number,
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
      async handle(samplesData, channelsCount) {
        const args: NormalizeOffsetWithWindowArgs = {
          samplesData,
          channelsCount,
          channels,
          windowSamples,
        }

        if (useWorker) {
          const data = await audioClient.normalizeOffsetWithWindow(args)
          return data.data
        }
        else {
          normalizeOffsetWithWindow(args)
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
      windowSamples : [2, 1, 3, 7, 20, 50],
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
      windowSamples : [2, 1, 3, 7, 20, 50],
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

  it('peak start', async function () {
    await testVariants({
      useWorker    : [false, true],
      samplesCount : [100],
      channelsCount: [1, 2, 3],
      channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
        : channelsCount === 2 ? [[0, 1], [0], [1]]
          : [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
      windowSamples : [10, 2, 3, 1, 7, 20, 50],
      amplitude     : [1, 0, 0.5, -1, -0.25],
      patternsActual: ({channelsCount, channels, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
          ['fill', 0, 1, active ? 0.1 * amplitude : 0],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, amplitude, windowSamples}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
          ['fill', 0, 1, active ? 0.1 * amplitude : 0],
          ['fill', 0, Math.ceil(windowSamples / 2), active ? -((0.1 * windowSamples + 0.1) / windowSamples) * amplitude : 0],
          ['fill', Math.ceil(windowSamples / 2), windowSamples + Math.ceil(windowSamples / 2), active ? -((0.1 * windowSamples + 0.1) / windowSamples) * amplitude : 0, active ? -0.1 * amplitude : 0],
          ['fill', windowSamples + Math.ceil(windowSamples / 2), 100, active ? -0.1 * amplitude : 0],
        ]),
      ],
    })()
  })

  it('peak end', async function () {
    await testVariants({
      useWorker    : [false, true],
      samplesCount : [100],
      channelsCount: [1, 2, 3],
      channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
        : channelsCount === 2 ? [[0, 1], [0], [1]]
          : [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
      windowSamples : [10, 2, 1, 4, 5, 20, 25, 50],
      amplitude     : [0, 1, 0.5, -1, -0.25],
      patternsActual: ({channelsCount, channels, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
          ['fill', 99, 100, active ? 0.1 * amplitude : 0],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, amplitude, windowSamples}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
          ['fill', 99, 100, active ? 0.1 * amplitude : 0],
          ['fill', 100 - windowSamples + Math.ceil(windowSamples / 2), 100, active ? -((0.1 * windowSamples + 0.1) / windowSamples) * amplitude : 0],
          ['fill', 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), 100 - windowSamples + Math.ceil(windowSamples / 2), active ? -0.1 * amplitude : 0, active ? -((0.1 * windowSamples + 0.1) / windowSamples) * amplitude : 0],
          ['fill', 0, 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), active ? -0.1 * amplitude : 0],
        ]),
      ],
    })()
  })

  it('peak middle', async function () {
    await testVariants({
      useWorker    : [false, true],
      windowSamples: [10, 2, 1, 5, 25],
      samplesCount : [100],
      channelsCount: [1, 2, 3],
      channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
        : channelsCount === 2 ? [[0, 1], [0], [1]]
          : [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
      amplitude     : [0, 1, 0.5, -1, -0.25],
      patternsActual: ({channelsCount, channels, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
          ['fill', 50, 51, active ? 0.1 * amplitude : 0],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, amplitude, windowSamples}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
          ['fill', 50, 51, active ? 0.1 * amplitude : 0],

          ['fill', 0, 50 - windowSamples + Math.ceil(windowSamples / 2), active ? -0.1 * amplitude : 0],
          ['fill', 50 - windowSamples + Math.ceil(windowSamples / 2), 50 + Math.ceil(windowSamples / 2), active ? -0.1 * amplitude : 0, active ? -((0.1 * windowSamples + 0.1) / windowSamples) * amplitude : 0],
          ['fill', 50 + Math.ceil(windowSamples / 2), 50 + windowSamples + Math.ceil(windowSamples / 2), active ? -((0.1 * windowSamples + 0.1) / windowSamples) * amplitude : 0, active ? -0.1 * amplitude : 0],
          ['fill', 50 + windowSamples + Math.ceil(windowSamples / 2), 100, active ? -0.1 * amplitude : 0],
        ]),
      ],
    })()
  })
})
