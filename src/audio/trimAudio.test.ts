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

		spaceStart,
		spaceEnd,

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

		spaceStart: number,
		spaceEnd: number,

		samplesCountExpect: number,
		patternsActual: SamplesPattern[][],
		patternsExpect: SamplesPattern[][],
	}) => {
		testSamplesWithPatterns({
			maxDiff: 1e-7,
			actual : {
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
						space               : spaceStart,
					},
					end: windowSamplesEnd && {
						windowSamples       : windowSamplesEnd,
						minContentSamples   : minContentSamplesEnd,
						minContentDispersion: minContentDispersionEnd,
						maxSilenceSamples   : maxSilenceSamplesEnd,
						space               : spaceEnd,
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

			spaceStart: [0, 100],
			spaceEnd  : [0, 100],
			
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

			spaceStart: [0, 100],
			spaceEnd  : [0, 100],

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

			spaceStart: [0, 1, 10, 100],
			spaceEnd  : [0, 100],

			position          : [0, 1, 50, 53, 83, 84],
			samplesCountExpect: ({samplesCountActual, position, spaceStart}) => [
				Math.min(samplesCountActual, samplesCountActual - position + spaceStart),
			],
			patternsActual: ({channelsCount, channels, position}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', position, position + 16, active ? 1 : 0],
				]),
			],
			patternsExpect: ({channelsCount, channels, position, spaceStart}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', Math.min(position, spaceStart), Math.min(position, spaceStart) + 16, active ? 1 : 0],
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

			spaceStart: [0, 100],
			spaceEnd  : [0, 1, 10, 100],

			position          : [0, 1, 50, 53, 83, 84],
			samplesCountExpect: ({samplesCountActual, position, spaceEnd}) => [
				Math.min(samplesCountActual, position + 16 + spaceEnd),
			],
			patternsActual: ({channelsCount, channels, position}) => [
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

			windowSamplesStart       : [16, 8, 2],
			minContentSamplesStart   : [16, 8, 2, 1],
			minContentDispersionStart: [1],
			maxSilenceSamplesStart   : [16],

			windowSamplesEnd       : [16, 8, 2],
			minContentSamplesEnd   : [16, 8, 2, 1],
			minContentDispersionEnd: [1],
			maxSilenceSamplesEnd   : [16],

			spaceStart: [0],
			spaceEnd  : [0],

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

	it('start/end with space', function () {
		testVariants({
			samplesCountActual: [100],
			channelsCount     : [1, 2, 3],
			channels          : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1]]
					: [[0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],

			windowSamplesStart       : [8],
			minContentSamplesStart   : [16],
			minContentDispersionStart: [1],
			maxSilenceSamplesStart   : [5],

			windowSamplesEnd       : [12],
			minContentSamplesEnd   : [24],
			minContentDispersionEnd: [1],
			maxSilenceSamplesEnd   : [13],

			spaceStart: [0],
			spaceEnd  : [0],

			samplesCountExpect: [77],
			patternsActual    : ({channelsCount, channels}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', 10, 18, active ? 1 : 0],
					['fill-noise', 23, 35, active ? 1 : 0],
					['fill-noise', 50, 62, active ? 1 : 0],
					['fill-noise', 75, 87, active ? 1 : 0],
				]),
			],
			patternsExpect: ({channelsCount, channels}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', 0, 8, active ? 1 : 0],
					['fill-noise', 13, 25, active ? 1 : 0],
					['fill-noise', 40, 52, active ? 1 : 0],
					['fill-noise', 65, 77, active ? 1 : 0],
				]),
			],
		})
	})

	it('start/end with space silence', function () {
		testVariants({
			samplesCountActual: [100],
			channelsCount     : [1, 2, 3],
			channels          : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1]]
					: [[0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],

			windowSamplesStart       : [10],
			minContentSamplesStart   : [20],
			minContentDispersionStart: [1],
			maxSilenceSamplesStart   : [10],

			windowSamplesEnd       : [10],
			minContentSamplesEnd   : [20],
			minContentDispersionEnd: [1],
			maxSilenceSamplesEnd   : [9],

			spaceStart: [0],
			spaceEnd  : [0],

			samplesCountExpect: [0],
			patternsActual    : ({channelsCount, channels}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', 30, 40, active ? 1 : 0],
					['fill-noise', 50, 60, active ? 1 : 0],
				]),
			],
			patternsExpect: [null],
		})
	})

	it('start/end skip space', function () {
		testVariants({
			samplesCountActual: [100],
			channelsCount     : [1, 2, 3],
			channels          : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1]]
					: [[0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],

			windowSamplesStart       : [4],
			minContentSamplesStart   : [8],
			minContentDispersionStart: [1],
			maxSilenceSamplesStart   : [3],

			windowSamplesEnd       : [4],
			minContentSamplesEnd   : [8],
			minContentDispersionEnd: [1],
			maxSilenceSamplesEnd   : [3],

			spaceStart: [0],
			spaceEnd  : [0],

			samplesCountExpect: [11],
			patternsActual    : ({channelsCount, channels}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', 10, 14, active ? 1 : 0],
					['fill-noise', 18, 22, active ? 1 : 0],
					['fill-noise', 25, 29, active ? 1 : 0],
					['fill-noise', 33, 37, active ? 1 : 0],
				]),
			],
			patternsExpect: ({channelsCount, channels}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', 0, 4, active ? 1 : 0],
					['fill-noise', 7, 11, active ? 1 : 0],
				]),
			],
		})
	})
})
