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
				trimAudio({
					samplesData,
					channelsCount,
					channels,
					start: {
						windowSamples       : windowSamplesStart,
						minContentSamples   : minContentSamplesStart,
						minContentDispersion: minContentDispersionStart,
						maxSilenceSamples   : maxSilenceSamplesStart,
					},
					end: {
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
			
			windowSamplesStart       : [10],
			minContentSamplesStart   : [10],
			minContentDispersionStart: [10],
			maxSilenceSamplesStart   : [10],

			windowSamplesEnd       : [10],
			minContentSamplesEnd   : [10],
			minContentDispersionEnd: [10],
			maxSilenceSamplesEnd   : [10],
			
			amplitude         : [0, 1, 0.5, -1, -0.25],
			samplesCountExpect: [0],
			patternsActual    : ({channelsCount, channels, amplitude}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 1, active ? 0 : amplitude],
				]),
			],
			patternsExpect: () => [],
		})
	})

	// it('silence 1', function () {
	// 	testVariants({
	// 		samplesCountActual : [100],
	// 		channelsCount: [1, 2, 3],
	// 		channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
	// 			: channelsCount === 2 ? [[0, 1]]
	// 				: [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
	// 		amplitude     : [0, 1, 0.5, -1, -0.25],
	// 		patternsActual: ({channelsCount, channels, amplitude}) => [
	// 			mapChannels(channelsCount, channels, (channel, active) => [
	// 				['fill', 0, 100, active ? 0.2 * amplitude : 0.1],
	// 			]),
	// 		],
	// 		patternsExpect: ({channelsCount, channels, amplitude}) => [
	// 			mapChannels(channelsCount, channels, (channel, active) => [
	// 				['fill', 0, 100, active ? 0 : 0.1],
	// 			]),
	// 		],
	// 	})
	// })
	//
	// it('peak', function () {
	// 	testVariants({
	// 		samplesCountActual : [100],
	// 		channelsCount: [1, 2, 3],
	// 		channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
	// 			: channelsCount === 2 ? [[0, 1]]
	// 				: [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
	// 		position      : [0, 73, 99],
	// 		amplitude     : [0, 1, 0.5, -1, -0.25],
	// 		patternsActual: ({channelsCount, channels, position, amplitude}) => [
	// 			mapChannels(channelsCount, channels, (channel, active) => [
	// 				['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
	// 				['fill', position, position + 1, active ? 0.1 * amplitude : 0],
	// 			]),
	// 		],
	// 		patternsExpect: ({channelsCount, channels, position, amplitude, samplesCountActual}) => [
	// 			mapChannels(channelsCount, channels, (channel, active) => [
	// 				['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
	// 				['fill', position, position + 1, active ? 0.1 * amplitude : 0],
	// 				['fill', 0, 100, active ? -(0.1 + 0.1 * samplesCountActual) / samplesCountActual * amplitude : 0],
	// 			]),
	// 		],
	// 	})
	// })
})
