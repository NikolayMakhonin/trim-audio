/* eslint-disable @typescript-eslint/no-shadow */
import {SamplesPattern} from './test/generateSamples'
import {testSamplesWithPatterns} from './test/testSamples'
import {mapChannels} from './test/mapChannels'
import {normalizeAmplitudeWithWindow, NormalizeAmplitudeWithWindowArgs} from './normalizeAmplitudeWithWindow'
import {sign} from './test/sign'
import {createTestVariants} from '@flemist/test-variants'
import {audioClient} from 'src/audio/test/audioClient'

describe('audio > normalizeAmplitudeWithWindow', function () {
  this.timeout(30000)

  after(async () => {
    await audioClient.terminate()
  })

  const testVariants = createTestVariants(({
    useWorker,
    samplesCount,
    channelsCount,
    channels,
    separateChannels,
    coef,
    windowSamples,
    patternsActual,
    patternsExpect,
  }: {
    useWorker: boolean,
		samplesCount: number,
		channelsCount: number,
		channels: number[],
		separateChannels?: boolean,
		coef: number,
		windowSamples: number,
		patternsActual: SamplesPattern[][],
		patternsExpect: SamplesPattern[][],
	}) => {
    return testSamplesWithPatterns({
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
        const args: NormalizeAmplitudeWithWindowArgs = {
          samplesData,
          channelsCount,
          channels,
          separateChannels,
          coef,
          windowSamples,
        }

        if (useWorker) {
          const data = await audioClient.normalizeAmplitudeWithWindow(args)
          return data.data
        }
        else {
          normalizeAmplitudeWithWindow(args)
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
      windowSamples   : [2, 1, 3, 7, 20, 50],
      coef            : [0, 1],
      separateChannels: [false, true],
      amplitude       : [0, 1, 0.5, -1, -0.25],
      patternsActual  : ({channelsCount, channels, amplitude}) => [
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
      windowSamples   : [2, 1, 3, 7, 20, 50],
      coef            : [0.6],
      separateChannels: [false, true],
      amplitude       : [0, 1, 0.5, -1, -0.25],
      patternsActual  : ({channelsCount, channels, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.2 * amplitude : 0.1],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.6 * sign(amplitude) : 0.1],
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
      windowSamples   : [10, 2, 1, 3, 7, 20, 50],
      coef            : [0.6],
      separateChannels: [false, true],
      amplitude       : [1, 0, 0.5, -1, -0.25],
      patternsActual  : ({channelsCount, channels, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
          ['fill', 0, 1, active ? 0.1 * amplitude : 0],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, amplitude, windowSamples}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 1, active ? 0.6 * sign(amplitude) : 0.1],
          ['fill', 1, windowSamples, active ? 0.3 * sign(amplitude) : 0.1],
          ['fill', windowSamples, windowSamples + Math.ceil(windowSamples / 2), active ? 0.3 * sign(amplitude) : 0.1, active ? 0.6 * sign(amplitude) : 0.1],
          ['fill', windowSamples + Math.ceil(windowSamples / 2), 100, active ? 0.6 * sign(amplitude) : 0.1],
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
      windowSamples   : [10, 2, 1, 4, 5, 20, 25, 50],
      coef            : [0.6],
      separateChannels: [false, true],
      amplitude       : [0, 1, 0.5, -1, -0.25],
      patternsActual  : ({channelsCount, channels, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
          ['fill', 99, 100, active ? 0.1 * amplitude : 0],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, amplitude, windowSamples}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 99, 100, active ? 0.6 * sign(amplitude) : 0.1],
          ['fill', 100 - windowSamples, 99, active ? 0.3 * sign(amplitude) : 0.1],
          ['fill', 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), 100 - windowSamples, active ? 0.6 * sign(amplitude) : 0.1, active ? 0.3 * sign(amplitude) : 0.1],
          ['fill', 0, 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), active ? 0.6 * sign(amplitude) : 0.1],
        ]),
      ],
    })()
  })

  it('peak middle', async function () {
    await testVariants({
      useWorker    : [false, true],
      samplesCount : [100],
      channelsCount: [1, 2, 3],
      channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
        : channelsCount === 2 ? [[0, 1], [0], [1]]
          : [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
      windowSamples   : [10, 2, 1, 5, 25, 50],
      coef            : [0.6],
      separateChannels: [false, true],
      amplitude       : [0, 1, 0.5, -1, -0.25],
      patternsActual  : ({channelsCount, channels, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
          ['fill', 50, 51, active ? 0.1 * amplitude : 0],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, amplitude, windowSamples}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 50 - windowSamples + Math.ceil(windowSamples / 2), active ? 0.6 * sign(amplitude) : 0.1],
          ['fill', 50 - windowSamples + Math.ceil(windowSamples / 2), 50, active ? 0.6 * sign(amplitude) : 0.1, active ? 0.3 * sign(amplitude) : 0.1],
          ['fill', 50, 51, active ? 0.6 * sign(amplitude) : 0.1],
          ['fill', 51, 50 + windowSamples, active ? 0.3 * sign(amplitude) : 0.1],
          ['fill', 50 + windowSamples, 50 + windowSamples + Math.ceil(windowSamples / 2), active ? 0.3 * sign(amplitude) : 0.1, active ? 0.6 * sign(amplitude) : 0.1],
          ['fill', 50 + windowSamples + Math.ceil(windowSamples / 2), 100, active ? 0.6 * sign(amplitude) : 0.1],
        ]),
      ],
    })()
  })

  it('peak start/end', async function () {
    await testVariants({
      useWorker    : [false, true],
      samplesCount : [100],
      channelsCount: [1, 2, 3],
      channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
        : channelsCount === 2 ? [[0, 1], [0], [1]]
          : [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
      windowSamples   : [10, 2, 1, 4, 5, 20, 25],
      coef            : [0.6],
      separateChannels: [false, true],
      amplitude       : [0, 1, 0.5, -1, -0.25],
      patternsActual  : ({channelsCount, channels, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
          ['fill', 0, 1, active ? 0.1 * amplitude : 0],
          ['fill', 99, 100, active ? 0.1 * amplitude : 0],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, amplitude, windowSamples}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 1, active ? 0.6 * sign(amplitude) : 0.1],
          ['fill', 1, windowSamples, active ? 0.3 * sign(amplitude) : 0.1],
          ['fill', windowSamples, windowSamples + Math.ceil(windowSamples / 2), active ? 0.3 * sign(amplitude) : 0.1, active ? 0.6 * sign(amplitude) : 0.1],
          ['fill', windowSamples + Math.ceil(windowSamples / 2), 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), active ? 0.6 * sign(amplitude) : 0.1],
          ['fill', 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), 100 - windowSamples, active ? 0.6 * sign(amplitude) : 0.1, active ? 0.3 * sign(amplitude) : 0.1],
          ['fill', 100 - windowSamples, 99, active ? 0.3 * sign(amplitude) : 0.1],
          ['fill', 99, 100, active ? 0.6 * sign(amplitude) : 0.1],
        ]),
      ],
    })()
  })

  it('separateChannels', async function () {
    await testVariants({
      useWorker    : [false, true],
      samplesCount : [100],
      channelsCount: [1, 2, 3],
      channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
        : channelsCount === 2 ? [[0, 1], [0], [1]]
          : [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
      windowSamples   : [10, 2, 1, 4, 5, 20, 25],
      coef            : [0.6],
      separateChannels: [true],
      amplitude       : [0, 1, 0.5, -1, -0.25],
      patternsActual  : ({channelsCount, channels, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? [0.1, 0.2, 0.3][channel] * amplitude : 0.1],
          ['fill', 0, 1, active ? [0.1, 0.2, 0.3][channel] * amplitude : 0],
          ['fill', 99, 100, active ? [0.1, 0.2, 0.3][channel] * amplitude : 0],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, amplitude, windowSamples}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          // ['fill', 0, 100, active ? [0.3, 0.2, 0.15][channel] * sign(amplitude) : 0.1],
          // ['fill', position, position + 1, active ? [0.3, 0.4, 0.45][channel] * sign(amplitude) : 0],

          ['fill', 0, 1, active ? 0.6 * sign(amplitude) : 0.1],
          ['fill', 1, windowSamples, active ? 0.3 * sign(amplitude) : 0.1],
          ['fill', windowSamples, windowSamples + Math.ceil(windowSamples / 2), active ? 0.3 * sign(amplitude) : 0.1, active ? 0.6 * sign(amplitude) : 0.1],
          ['fill', windowSamples + Math.ceil(windowSamples / 2), 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), active ? 0.6 * sign(amplitude) : 0.1],
          ['fill', 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), 100 - windowSamples, active ? 0.6 * sign(amplitude) : 0.1, active ? 0.3 * sign(amplitude) : 0.1],
          ['fill', 100 - windowSamples, 99, active ? 0.3 * sign(amplitude) : 0.1],
          ['fill', 99, 100, active ? 0.6 * sign(amplitude) : 0.1],
        ]),
      ],
    })()
  })

  it('not separateChannels', async function () {
    await testVariants({
      useWorker    : [false, true],
      samplesCount : [100],
      channelsCount: [1, 2, 3],
      channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
        : channelsCount === 2 ? [[0], [0, 1]]
          : [[], [0], [0, 1], [0, 2], [0, 1, 2]],
      windowSamples   : [10, 2, 1, 4, 5, 20, 25],
      coef            : [0.6],
      separateChannels: [false],
      amplitude       : [0, 1, 0.5, -1, -0.25],
      patternsActual  : ({channelsCount, channels, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? [0.3, 0.2, 0.1][channel] * amplitude : 0.1],
          ['fill', 0, 1, active ? [0.3, 0.2, 0.1][channel] * amplitude : 0],
          ['fill', 99, 100, active ? [0.3, 0.2, 0.1][channel] * amplitude : 0],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, amplitude, windowSamples}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 1, active ? [0.6, 0.4, 0.2][channel] * sign(amplitude) : 0.1],
          ['fill', 1, windowSamples, active ? [0.3, 0.2, 0.1][channel] * sign(amplitude) : 0.1],
          ['fill', windowSamples, windowSamples + Math.ceil(windowSamples / 2), active ? [0.3, 0.2, 0.1][channel] * sign(amplitude) : 0.1, active ? [0.6, 0.4, 0.2][channel] * sign(amplitude) : 0.1],
          ['fill', windowSamples + Math.ceil(windowSamples / 2), 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), active ? [0.6, 0.4, 0.2][channel] * sign(amplitude) : 0.1],
          ['fill', 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), 100 - windowSamples, active ? [0.6, 0.4, 0.2][channel] * sign(amplitude) : 0.1, active ? [0.3, 0.2, 0.1][channel] * sign(amplitude) : 0.1],
          ['fill', 100 - windowSamples, 99, active ? [0.3, 0.2, 0.1][channel] * sign(amplitude) : 0.1],
          ['fill', 99, 100, active ? [0.6, 0.4, 0.2][channel] * sign(amplitude) : 0.1],
        ]),
      ],
    })()
  })
})
