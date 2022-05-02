/* eslint-disable @typescript-eslint/no-shadow */
import {SamplesPattern} from './test/generateSamples'
import {createTestVariants} from '../test/createTestVariants'
import {testSamplesWithPatterns} from './test/testSamples'
import {mapChannels} from './test/mapChannels'
import {trimAudio} from './trimAudio'

describe('audio > trimAudio', function () {
	this.timeout(30000)

	const testVariants = createTestVariants(({
		samplesCountActual,
		channelsCount,
		channels,

		windowSamplesStart,
		minContentSamplesStart,
		minContentDispersionStart,
		maxSilenceSamplesStart,

		windowSamplesEnd,
		minContentSamplesEnd,
		minContentDispersionEnd,
		maxSilenceSamplesEnd,

		samplesCountExpect,
		patternsActual,
		patternsExpect,
	}: {
		samplesCountActual: number,
		channelsCount: number,
		channels: number[],
		
		windowSamplesStart: number,
		minContentSamplesStart: number,
		minContentDispersionStart: number,
		maxSilenceSamplesStart: number,
		
		windowSamplesEnd: number,
		minContentSamplesEnd: number,
		minContentDispersionEnd: number,
		maxSilenceSamplesEnd: number,

		samplesCountExpect: number,
		patternsActual: SamplesPattern[][],
		patternsExpect: SamplesPattern[][],
	}) => {
		testSamplesWithPatterns({
			actual: {
				samplesCount: samplesCountActual,
				channelsCount,
				patterns    : patternsActual,
			},
			expect: {
				samplesCount: samplesCountExpect,
				channelsCount,
				patterns    : patternsExpect,
			},
			handle(samplesData, channelsCount, samplesCount) {
				return trimAudio({
					samplesData,
					channelsCount,
					channels,
					start: windowSamplesStart && {
						windowSamples       : windowSamplesStart,
						minContentSamples   : minContentSamplesStart,
						minContentDispersion: minContentDispersionStart,
						maxSilenceSamples   : maxSilenceSamplesStart,
					},
					end: windowSamplesEnd && {
						windowSamples       : windowSamplesEnd,
						minContentSamples   : minContentSamplesEnd,
						minContentDispersion: minContentDispersionEnd,
						maxSilenceSamples   : maxSilenceSamplesEnd,
					},
				})
			},
		})
	})

	it('silence 0', function () {
		testVariants({
			samplesCountActual: [100],
			channelsCount     : [1, 2, 3],
			channels          : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1]]
					: [[0, 2], [1, 2], [0, 1, 2]],

			amplitude: [0, 1, 0.5, -1, -0.25],

			windowSamplesStart       : [2, 10, 100],
			minContentSamplesStart   : [1, 10, 100],
			minContentDispersionStart: ({amplitude, windowSamplesStart, channels}) => [
				amplitude * amplitude + 1e-8,
			],
			maxSilenceSamplesStart: [10],

			windowSamplesEnd       : [2, 10, 100],
			minContentSamplesEnd   : [1, 10, 100],
			minContentDispersionEnd: ({amplitude, windowSamplesEnd, channels}) => [
				amplitude * amplitude + 1e-8,
			],
			maxSilenceSamplesEnd: [10],
			
			samplesCountExpect: [0],
			patternsActual    : ({channelsCount, channels, amplitude}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', 0, 100, amplitude],
				]),
			],
			patternsExpect: () => [null],
		})
	})

	it('silence 1', function () {
		testVariants({
			samplesCountActual: [100],
			channelsCount     : [1, 2, 3],
			channels          : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1]]
					: [[0, 2], [1, 2], [0, 1, 2]],

			amplitude: [1, 0.5, -1, -0.25, 1e-8, -1e-8],

			windowSamplesStart       : [2, 10, 100],
			minContentSamplesStart   : [1, 10, 100],
			minContentDispersionStart: ({amplitude, windowSamplesStart, channels}) => [
				amplitude * amplitude,
			],
			maxSilenceSamplesStart: [10],

			windowSamplesEnd       : [2, 10, 100],
			minContentSamplesEnd   : [1, 10, 100],
			minContentDispersionEnd: ({amplitude, windowSamplesEnd, channels}) => [
				amplitude * amplitude,
			],
			maxSilenceSamplesEnd: [10],

			samplesCountExpect: [100],
			patternsActual    : ({channelsCount, channels, amplitude}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', 0, 100, amplitude],
				]),
			],
			patternsExpect: ({channelsCount, channels, amplitude}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', 0, 100, amplitude],
				]),
			],
		})
	})

	it('start', function () {
		testVariants({
			samplesCountActual: [100],
			channelsCount     : [1, 2, 3],
			channels          : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1]]
					: [[0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],

			windowSamplesStart       : [16, 8, 4, 2],
			minContentSamplesStart   : [16, 8, 4, 2, 1],
			minContentDispersionStart: [1],
			maxSilenceSamplesStart   : [16, 100],

			windowSamplesEnd       : [null],
			minContentSamplesEnd   : [null],
			minContentDispersionEnd: [null],
			maxSilenceSamplesEnd   : [null],

			position          : [0, 1, 50, 53, 83, 84],
			samplesCountExpect: ({samplesCountActual, position}) => [samplesCountActual - position],
			patternsActual    : ({channelsCount, channels, position}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', position, position + 16, active ? 1 : 0],
				]),
			],
			patternsExpect: ({channelsCount, channels}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', 0, 16, active ? 1 : 0],
				]),
			],
		})
	})

	it('end', function () {
		testVariants({
			samplesCountActual: [100],
			channelsCount     : [1, 2, 3],
			channels          : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1]]
					: [[0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],

			windowSamplesStart       : [null],
			minContentSamplesStart   : [null],
			minContentDispersionStart: [null],
			maxSilenceSamplesStart   : [null],

			windowSamplesEnd       : [16, 8, 4, 2],
			minContentSamplesEnd   : [16, 8, 4, 2, 1],
			minContentDispersionEnd: [1],
			maxSilenceSamplesEnd   : [16, 100],

			position          : [0, 1, 50, 53, 83, 84],
			samplesCountExpect: ({position}) => [position + 16],
			patternsActual    : ({channelsCount, channels, position}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', position, position + 16, active ? 1 : 0],
				]),
			],
			patternsExpect: ({channelsCount, channels, position}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', position, position + 16, active ? 1 : 0],
				]),
			],
		})
	})

	it('start/end', function () {
		testVariants({
			samplesCountActual: [100],
			channelsCount     : [1, 2, 3],
			channels          : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1]]
					: [[0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],

			windowSamplesStart       : [16, 8, 4, 2],
			minContentSamplesStart   : [16, 8, 4, 2, 1],
			minContentDispersionStart: [1],
			maxSilenceSamplesStart   : [16, 100],

			windowSamplesEnd       : [16, 8, 4, 2],
			minContentSamplesEnd   : [16, 8, 4, 2, 1],
			minContentDispersionEnd: [1],
			maxSilenceSamplesEnd   : [16, 100],

			position          : [0, 1, 50, 53, 83, 84],
			samplesCountExpect: [16],
			patternsActual    : ({channelsCount, channels, position}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', position, position + 16, active ? 1 : 0],
				]),
			],
			patternsExpect: ({channelsCount, channels, position}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', 0, 16, active ? 1 : 0],
				]),
			],
		})
	})
})
