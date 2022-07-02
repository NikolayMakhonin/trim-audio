/* eslint-disable @typescript-eslint/no-shadow */
import {normalizeAmplitudeSimple, NormalizeAmplitudeSimpleArgs} from './normalizeAmplitudeSimple'
import {SamplesPattern} from './test/generateSamples'
import {testSamplesWithPatterns} from './test/testSamples'
import {mapChannels} from './test/mapChannels'
import {sign} from './test/sign'
import {createTestVariants} from '@flemist/test-variants'
import {audioClient} from 'src/audio/test/audioClient'

describe('audio > normalizeAmplitudeSimple', function () {
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
    coef,
    separateChannels,
  }: {
    useWorker: boolean,
		samplesCount: number,
		channelsCount: number,
		channels: number[],
		patternsActual: SamplesPattern[][],
		patternsExpect: SamplesPattern[][],
		coef: number,
		separateChannels: boolean,
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
        const args: NormalizeAmplitudeSimpleArgs = {
          samplesData,
          channelsCount,
          channels,
          coef,
          separateChannels,
        }

        if (useWorker) {
          const data = await audioClient.normalizeAmplitudeSimple(args)
          return data.data
        }
        else {
          normalizeAmplitudeSimple(args)
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

  it('peak', async function () {
    await testVariants({
      useWorker    : [false, true],
      samplesCount : [100],
      channelsCount: [1, 2, 3],
      channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
        : channelsCount === 2 ? [[0, 1]]
          : [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
      coef            : [0.6],
      separateChannels: [false, true],
      position        : [0, 73, 99],
      amplitude       : [0, 1, 0.5, -1, -0.25],
      patternsActual  : ({channelsCount, channels, position, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
          ['fill', position, position + 1, active ? 0.1 * amplitude : 0],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, position, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.3 * sign(amplitude) : 0.1],
          ['fill', position, position + 1, active ? 0.3 * sign(amplitude) : 0],
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
        : channelsCount === 2 ? [[0, 1]]
          : [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
      coef            : [0.6],
      separateChannels: [true],
      position        : [0, 73, 99],
      amplitude       : [0, 1, 0.5, -1, -0.25],
      patternsActual  : ({channelsCount, channels, position, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
          ['fill', position, position + 1, active ? [0.1, 0.2, 0.3][channel] * amplitude : 0],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, position, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? [0.3, 0.2, 0.15][channel] * sign(amplitude) : 0.1],
          ['fill', position, position + 1, active ? [0.3, 0.4, 0.45][channel] * sign(amplitude) : 0],
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
      coef            : [0.6],
      separateChannels: [false],
      position        : [0, 73, 99],
      amplitude       : [0, 1, 0.5, -1, -0.25],
      patternsActual  : ({channelsCount, channels, position, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
          ['fill', position, position + 1, active ? [0.3, 0.2, 0.1][channel] * amplitude : 0],
        ]),
      ],
      patternsExpect: ({channelsCount, channels, position, amplitude}) => [
        mapChannels(channelsCount, channels, (channel, active) => [
          ['fill', 0, 100, active ? 0.15 * sign(amplitude) : 0.1],
          ['fill', position, position + 1, active ? [0.45, 0.3, 0.15][channel] * sign(amplitude) : 0],
        ]),
      ],
    })()
  })
})
