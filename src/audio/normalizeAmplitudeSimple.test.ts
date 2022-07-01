/* eslint-disable @typescript-eslint/no-shadow */
import {normalizeAmplitudeSimple} from './normalizeAmplitudeSimple'
import {SamplesPattern} from './test/generateSamples'
import {createTestVariants} from '../test/createTestVariants'
import {testSamplesWithPatterns} from './test/testSamples'
import {mapChannels} from './test/mapChannels'
import {sign} from './test/sign'

describe('audio > normalizeAmplitudeSimple', function () {
  this.timeout(30000)

  const testVariants = createTestVariants(({
    samplesCount,
    channelsCount,
    channels,
    patternsActual,
    patternsExpect,
    coef,
    separateChannels,
  }: {
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
      handle(samplesData, channelsCount, samplesCount) {
        normalizeAmplitudeSimple({
          samplesData,
          channelsCount,
          channels,
          coef,
          separateChannels,
        })
      },
    })
  })

  it('silence 0', function () {
    testVariants({
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
    })
  })

  it('silence 1', function () {
    testVariants({
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
    })
  })

  it('peak', function () {
    testVariants({
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
    })
  })

  it('separateChannels', function () {
    testVariants({
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
    })
  })

  it('not separateChannels', function () {
    testVariants({
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
    })
  })
})
