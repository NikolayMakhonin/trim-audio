/* eslint-disable @typescript-eslint/no-shadow */
import {normalizeOffsetSimple} from './normalizeOffsetSimple'
import {SamplesPattern} from './test/generateSamples'
import {createTestVariants} from '../test/createTestVariants'
import {testSamplesWithPatterns} from './test/testSamples'
import {mapChannels} from './test/mapChannels'
import {trimAudio} from './trimAudio'

describe('audio > trimAudio', function () {
	this.timeout(30000)

	const testVariants = createTestVariants(({
		samplesCount,
		channelsCount,
		channels,

		windowSamplesStart,
		minContentSamplesStart,
		minContentDecibelStart,
		maxSilenceSamplesStart,

		windowSamplesEnd,
		minContentSamplesEnd,
		minContentDecibelEnd,
		maxSilenceSamplesEnd,

		patternsActual,
		patternsExpected,
	}: {
		samplesCount: number,
		channelsCount: number,
		channels: number[],
		
		windowSamplesStart: number,
		minContentSamplesStart: number,
		minContentDecibelStart: number,
		maxSilenceSamplesStart: number,
		
		windowSamplesEnd: number,
		minContentSamplesEnd: number,
		minContentDecibelEnd: number,
		maxSilenceSamplesEnd: number,
		
		patternsActual: SamplesPattern[][],
		patternsExpected: SamplesPattern[][],
	}) => {
		testSamplesWithPatterns({
			samplesCount,
			channelsCount,
			maxDiff: 1e-7,
			patternsActual,
			patternsExpected,
			handle(samplesData, channelsCount, samplesCount) {
				trimAudio({
					samplesData,
					channelsCount,
					channels,
					start: {
						windowSamples    : windowSamplesStart,
						minContentSamples: minContentSamplesStart,
						minContentDecibel: minContentDecibelStart,
						maxSilenceSamples: maxSilenceSamplesStart,
					},
					end: {
						windowSamples    : windowSamplesEnd,
						minContentSamples: minContentSamplesEnd,
						minContentDecibel: minContentDecibelEnd,
						maxSilenceSamples: maxSilenceSamplesEnd,
					},
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
			
			windowSamplesStart    : [10],
			minContentSamplesStart: [10],
			minContentDecibelStart: [10],
			maxSilenceSamplesStart: [10],

			windowSamplesEnd    : [10],
			minContentSamplesEnd: [10],
			minContentDecibelEnd: [10],
			maxSilenceSamplesEnd: [10],
			
			amplitude     : [0, 1, 0.5, -1, -0.25],
			patternsActual: ({channelsCount, channels, amplitude}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 1, active ? 0 : amplitude],
				]),
			],
			patternsExpected: ({channelsCount, channels, amplitude}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 1, active ? 0 : amplitude],
				]),
			],
		})
	})

	// it('silence 1', function () {
	// 	testVariants({
	// 		samplesCount : [100],
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
	// 		patternsExpected: ({channelsCount, channels, amplitude}) => [
	// 			mapChannels(channelsCount, channels, (channel, active) => [
	// 				['fill', 0, 100, active ? 0 : 0.1],
	// 			]),
	// 		],
	// 	})
	// })
	//
	// it('peak', function () {
	// 	testVariants({
	// 		samplesCount : [100],
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
	// 		patternsExpected: ({channelsCount, channels, position, amplitude, samplesCount}) => [
	// 			mapChannels(channelsCount, channels, (channel, active) => [
	// 				['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
	// 				['fill', position, position + 1, active ? 0.1 * amplitude : 0],
	// 				['fill', 0, 100, active ? -(0.1 + 0.1 * samplesCount) / samplesCount * amplitude : 0],
	// 			]),
	// 		],
	// 	})
	// })
})
