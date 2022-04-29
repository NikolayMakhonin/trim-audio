/* eslint-disable @typescript-eslint/no-shadow */
import {normalizeOffsetWithWindow} from './normalizeOffsetWithWindow'
import {generateSamples, SamplesPattern} from './test/generateSamples'
import {createTestVariants} from '../test/createTestVariants'
import {testSamples} from './test/testSamples'

describe('node > normalizeOffsetWithWindow', function () {
	this.timeout(30000)

	const testVariants = createTestVariants(({
		samplesCount,
		channelsCount,
		channels,
		patternsActual,
		patternsExpected,
		windowSamples,
	}: {
		samplesCount: number,
		channelsCount: number,
		channels: number[],
		windowSamples: number,
		baseAmplitude: number,
		patternsActual: SamplesPattern[][],
		patternsExpected: SamplesPattern[][],
	}) => {
		testSamples({
			samplesCount,
			channelsCount,
			maxDiff: 1e-7,
			fillData(
				samplesDataActual,
				samplesDataExpect,
				channelsCount,
				samplesCount,
			) {
				generateSamples({
					samplesData: samplesDataActual,
					channelsCount,
					patterns   : patternsActual,
				})
				generateSamples({
					samplesData: samplesDataExpect,
					channelsCount,
					patterns   : patternsExpected,
				})
			},
			handle(samplesData, channelsCount, samplesCount) {
				normalizeOffsetWithWindow({
					samplesData,
					channelsCount,
					channels,
					windowSamples,
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
			windowSamples : [1, 3, 7, 20, 90, 98, 99, 100],
			baseAmplitude : [0, 0.3, 1],
			patternsActual: ({channels, baseAmplitude}) => [[
				[['fill', 0, 100, baseAmplitude], ['fill', 0, 100, channels.includes(0) ? 0 : 1]],
				[['fill', 0, 100, baseAmplitude], ['fill', 0, 100, channels.includes(1) ? 0 : 1]],
				[['fill', 0, 100, baseAmplitude], ['fill', 0, 100, channels.includes(2) ? 0 : 1]],
			]],
			patternsExpected: ({channels, baseAmplitude}) => [[
				[['fill', 0, 100, channels.includes(0) ? 0 : 1 + baseAmplitude]],
				[['fill', 0, 100, channels.includes(1) ? 0 : 1 + baseAmplitude]],
				[['fill', 0, 100, channels.includes(2) ? 0 : 1 + baseAmplitude]],
			]],
		})
	})

	// it('silence 1', function () {
	// 	testVariants({
	// 		samplesCount : [100],
	// 		channelsCount: [1, 2, 3],
	// 		channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
	// 			: channelsCount === 2 ? [[0, 1]]
	// 				: [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
	// 		patternsActual: ({channels}) => [[
	// 			[['fill', 0, 100, channels.includes(0) ? 0.2 : 0.1]],
	// 			[['fill', 0, 100, channels.includes(1) ? 0.2 : 0.1]],
	// 			[['fill', 0, 100, channels.includes(2) ? 0.2 : 0.1]],
	// 		]],
	// 		patternsExpected: ({channels}) => [[
	// 			[['fill', 0, 100, channels.includes(0) ? 0.6 : 0.1]],
	// 			[['fill', 0, 100, channels.includes(1) ? 0.6 : 0.1]],
	// 			[['fill', 0, 100, channels.includes(2) ? 0.6 : 0.1]],
	// 		]],
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
	// 		patternsActual: ({channels}) => [
	// 			[
	// 				[['fill', 0, 100, 0.1], ['fill', 0, 1, channels.includes(0) ? 0.1 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 0, 1, channels.includes(1) ? 0.1 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 0, 1, channels.includes(2) ? 0.1 : 0]],
	// 			],
	// 			[
	// 				[['fill', 0, 100, 0.1], ['fill', 73, 74, channels.includes(0) ? 0.1 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 73, 74, channels.includes(1) ? 0.1 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 73, 74, channels.includes(2) ? 0.1 : 0]],
	// 			],
	// 			[
	// 				[['fill', 0, 100, 0.1], ['fill', 99, 100, channels.includes(0) ? 0.1 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 99, 100, channels.includes(1) ? 0.1 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 99, 100, channels.includes(2) ? 0.1 : 0]],
	// 			],
	// 		],
	// 		patternsExpected: ({channels}) => [
	// 			[
	// 				[['fill', 0, 100, channels.includes(0) ? 0.3 : 0.1], ['fill', 0, 1, channels.includes(0) ? 0.3 : 0]],
	// 				[['fill', 0, 100, channels.includes(1) ? 0.3 : 0.1], ['fill', 0, 1, channels.includes(1) ? 0.3 : 0]],
	// 				[['fill', 0, 100, channels.includes(2) ? 0.3 : 0.1], ['fill', 0, 1, channels.includes(2) ? 0.3 : 0]],
	// 			],
	// 			[
	// 				[['fill', 0, 100, channels.includes(0) ? 0.3 : 0.1], ['fill', 73, 74, channels.includes(0) ? 0.3 : 0]],
	// 				[['fill', 0, 100, channels.includes(1) ? 0.3 : 0.1], ['fill', 73, 74, channels.includes(1) ? 0.3 : 0]],
	// 				[['fill', 0, 100, channels.includes(2) ? 0.3 : 0.1], ['fill', 73, 74, channels.includes(2) ? 0.3 : 0]],
	// 			],
	// 			[
	// 				[['fill', 0, 100, channels.includes(0) ? 0.3 : 0.1], ['fill', 99, 100, channels.includes(0) ? 0.3 : 0]],
	// 				[['fill', 0, 100, channels.includes(1) ? 0.3 : 0.1], ['fill', 99, 100, channels.includes(1) ? 0.3 : 0]],
	// 				[['fill', 0, 100, channels.includes(2) ? 0.3 : 0.1], ['fill', 99, 100, channels.includes(2) ? 0.3 : 0]],
	// 			],
	// 		],
	// 	})
	// })
	//
	// it('separateChannels', function () {
	// 	testVariants({
	// 		samplesCount : [100],
	// 		channelsCount: [1, 2, 3],
	// 		channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
	// 			: channelsCount === 2 ? [[0, 1]]
	// 				: [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
	// 		patternsActual: ({channels}) => [
	// 			[
	// 				[['fill', 0, 100, 0.1], ['fill', 0, 1, channels.includes(0) ? 0.1 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 0, 1, channels.includes(1) ? 0.2 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 0, 1, channels.includes(2) ? 0.3 : 0]],
	// 			],
	// 			[
	// 				[['fill', 0, 100, 0.1], ['fill', 73, 74, channels.includes(0) ? 0.1 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 73, 74, channels.includes(1) ? 0.2 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 73, 74, channels.includes(2) ? 0.3 : 0]],
	// 			],
	// 			[
	// 				[['fill', 0, 100, 0.1], ['fill', 99, 100, channels.includes(0) ? 0.1 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 99, 100, channels.includes(1) ? 0.2 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 99, 100, channels.includes(2) ? 0.3 : 0]],
	// 			],
	// 		],
	// 		patternsExpected: ({channels}) => [
	// 			[
	// 				[['fill', 0, 100, channels.includes(0) ? 0.3 : 0.1], ['fill', 0, 1, channels.includes(0) ? 0.3 : 0]],
	// 				[['fill', 0, 100, channels.includes(1) ? 0.2 : 0.1], ['fill', 0, 1, channels.includes(1) ? 0.4 : 0]],
	// 				[['fill', 0, 100, channels.includes(2) ? 0.15 : 0.1], ['fill', 0, 1, channels.includes(2) ? 0.45 : 0]],
	// 			],
	// 			[
	// 				[['fill', 0, 100, channels.includes(0) ? 0.3 : 0.1], ['fill', 73, 74, channels.includes(0) ? 0.3 : 0]],
	// 				[['fill', 0, 100, channels.includes(1) ? 0.2 : 0.1], ['fill', 73, 74, channels.includes(1) ? 0.4 : 0]],
	// 				[['fill', 0, 100, channels.includes(2) ? 0.15 : 0.1], ['fill', 73, 74, channels.includes(2) ? 0.45 : 0]],
	// 			],
	// 			[
	// 				[['fill', 0, 100, channels.includes(0) ? 0.3 : 0.1], ['fill', 99, 100, channels.includes(0) ? 0.3 : 0]],
	// 				[['fill', 0, 100, channels.includes(1) ? 0.2 : 0.1], ['fill', 99, 100, channels.includes(1) ? 0.4 : 0]],
	// 				[['fill', 0, 100, channels.includes(2) ? 0.15 : 0.1], ['fill', 99, 100, channels.includes(2) ? 0.45 : 0]],
	// 			],
	// 		],
	// 	})
	// })
	//
	// it('not separateChannels', function () {
	// 	testVariants({
	// 		samplesCount : [100],
	// 		channelsCount: [1, 2, 3],
	// 		channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
	// 			: channelsCount === 2 ? [[0], [0, 1]]
	// 				: [[], [0], [0, 1], [0, 2], [0, 1, 2]],
	// 		patternsActual: ({channels}) => [
	// 			[
	// 				[['fill', 0, 100, 0.1], ['fill', 0, 1, channels.includes(0) ? 0.3 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 0, 1, channels.includes(1) ? 0.2 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 0, 1, channels.includes(2) ? 0.1 : 0]],
	// 			],
	// 			[
	// 				[['fill', 0, 100, 0.1], ['fill', 73, 74, channels.includes(0) ? 0.3 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 73, 74, channels.includes(1) ? 0.2 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 73, 74, channels.includes(2) ? 0.1 : 0]],
	// 			],
	// 			[
	// 				[['fill', 0, 100, 0.1], ['fill', 99, 100, channels.includes(0) ? 0.3 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 99, 100, channels.includes(1) ? 0.2 : 0]],
	// 				[['fill', 0, 100, 0.1], ['fill', 99, 100, channels.includes(2) ? 0.1 : 0]],
	// 			],
	// 		],
	// 		patternsExpected: ({channels}) => [
	// 			[
	// 				[['fill', 0, 100, channels.includes(0) ? 0.15 : 0.1], ['fill', 0, 1, channels.includes(0) ? 0.45 : 0]],
	// 				[['fill', 0, 100, channels.includes(1) ? 0.15 : 0.1], ['fill', 0, 1, channels.includes(1) ? 0.3 : 0]],
	// 				[['fill', 0, 100, channels.includes(2) ? 0.15 : 0.1], ['fill', 0, 1, channels.includes(2) ? 0.15 : 0]],
	// 			],
	// 			[
	// 				[['fill', 0, 100, channels.includes(0) ? 0.15 : 0.1], ['fill', 73, 74, channels.includes(0) ? 0.45 : 0]],
	// 				[['fill', 0, 100, channels.includes(1) ? 0.15 : 0.1], ['fill', 73, 74, channels.includes(1) ? 0.3 : 0]],
	// 				[['fill', 0, 100, channels.includes(2) ? 0.15 : 0.1], ['fill', 73, 74, channels.includes(2) ? 0.15 : 0]],
	// 			],
	// 			[
	// 				[['fill', 0, 100, channels.includes(0) ? 0.15 : 0.1], ['fill', 99, 100, channels.includes(0) ? 0.45 : 0]],
	// 				[['fill', 0, 100, channels.includes(1) ? 0.15 : 0.1], ['fill', 99, 100, channels.includes(1) ? 0.3 : 0]],
	// 				[['fill', 0, 100, channels.includes(2) ? 0.15 : 0.1], ['fill', 99, 100, channels.includes(2) ? 0.15 : 0]],
	// 			],
	// 		],
	// 	})
	// })

	// it('silence 0.1', function () {
	// 	test({
	// 		samplesCount    : 100,
	// 		channelsCount   : 3,
	// 		fillRanges      : [[0, 100]],
	// 		amplitudesActual: [0.1, 0.1, 0.1],
	// 		amplitudesExpect: [0.6, 0.6, 0.6],
	// 		handle(samplesData, channelsCount, samplesCount) {
	// 			normalizeAmplitudeSimple({
	// 				samplesData,
	// 				channelsCount,
	// 				channels        : [0, 1, 2],
	// 				coef            : 0.6,
	// 				separateChannels: false,
	// 			})
	// 		},
	// 	})
	//
	// 	test({
	// 		samplesCount    : 100,
	// 		channelsCount   : 3,
	// 		fillRanges      : [[0, 100]],
	// 		amplitudesActual: [0.1, 0.3, 0.2],
	// 		amplitudesExpect: [0.2, 0.6, 0.4],
	// 		handle(samplesData, channelsCount, samplesCount) {
	// 			normalizeAmplitudeSimple({
	// 				samplesData,
	// 				channelsCount,
	// 				channels        : [0, 1, 2],
	// 				coef            : 0.6,
	// 				separateChannels: false,
	// 			})
	// 		},
	// 	})
	// })
	//
	// it('peak', function () {
	// 	test({
	// 		samplesCount    : 100,
	// 		channelsCount   : 3,
	// 		fillRanges      : [[0, 1]],
	// 		amplitudesActual: [0.1, 0.3, 0.2],
	// 		amplitudesExpect: [0.2, 0.6, 0.4],
	// 		handle(samplesData, channelsCount, samplesCount) {
	// 			normalizeAmplitudeSimple({
	// 				samplesData,
	// 				channelsCount,
	// 				channels        : [0, 1, 2],
	// 				coef            : 0.6,
	// 				separateChannels: false,
	// 			})
	// 		},
	// 	})
	//
	// 	test({
	// 		samplesCount    : 100,
	// 		channelsCount   : 3,
	// 		fillRanges      : [[99, 100]],
	// 		amplitudesActual: [0.1, 0.3, 0.2],
	// 		amplitudesExpect: [0.2, 0.6, 0.4],
	// 		handle(samplesData, channelsCount, samplesCount) {
	// 			normalizeAmplitudeSimple({
	// 				samplesData,
	// 				channelsCount,
	// 				channels        : [0, 1, 2],
	// 				coef            : 0.6,
	// 				separateChannels: false,
	// 			})
	// 		},
	// 	})
	//
	// 	test({
	// 		samplesCount    : 100,
	// 		channelsCount   : 3,
	// 		fillRanges      : [[73, 74]],
	// 		amplitudesActual: [0.1, 0.3, 0.2],
	// 		amplitudesExpect: [0.2, 0.6, 0.4],
	// 		handle(samplesData, channelsCount, samplesCount) {
	// 			normalizeAmplitudeSimple({
	// 				samplesData,
	// 				channelsCount,
	// 				channels        : [0, 1, 2],
	// 				coef            : 0.6,
	// 				separateChannels: false,
	// 			})
	// 		},
	// 	})
	// })
	//
	// it('peak separateChannels', function () {
	// 	test({
	// 		samplesCount    : 100,
	// 		channelsCount   : 3,
	// 		fillRanges      : [[0, 1]],
	// 		amplitudesActual: [0.1, 0.3, 0.2],
	// 		amplitudesExpect: [0.6, 0.6, 0.6],
	// 		handle(samplesData, channelsCount, samplesCount) {
	// 			normalizeAmplitudeSimple({
	// 				samplesData,
	// 				channelsCount,
	// 				channels        : [0, 1, 2],
	// 				coef            : 0.6,
	// 				separateChannels: true,
	// 			})
	// 		},
	// 	})
	//
	// 	test({
	// 		samplesCount    : 100,
	// 		channelsCount   : 3,
	// 		fillRanges      : [[99, 100]],
	// 		amplitudesActual: [0.1, 0.3, 0.2],
	// 		amplitudesExpect: [0.6, 0.6, 0.6],
	// 		handle(samplesData, channelsCount, samplesCount) {
	// 			normalizeAmplitudeSimple({
	// 				samplesData,
	// 				channelsCount,
	// 				channels        : [0, 1, 2],
	// 				coef            : 0.6,
	// 				separateChannels: true,
	// 			})
	// 		},
	// 	})
	//
	// 	test({
	// 		samplesCount    : 100,
	// 		channelsCount   : 3,
	// 		fillRanges      : [[73, 74]],
	// 		amplitudesActual: [0.1, 0.3, 0.2],
	// 		amplitudesExpect: [0.6, 0.6, 0.6],
	// 		handle(samplesData, channelsCount, samplesCount) {
	// 			normalizeAmplitudeSimple({
	// 				samplesData,
	// 				channelsCount,
	// 				channels        : [0, 1, 2],
	// 				coef            : 0.6,
	// 				separateChannels: true,
	// 			})
	// 		},
	// 	})
	// })
	//
	// it('peak select channels', function () {
	// 	test({
	// 		samplesCount    : 100,
	// 		channelsCount   : 3,
	// 		fillRanges      : [[0, 1]],
	// 		amplitudesActual: [0.1, 0.35, 0.2],
	// 		amplitudesExpect: [0.3, 0.35, 0.6],
	// 		handle(samplesData, channelsCount, samplesCount) {
	// 			normalizeAmplitudeSimple({
	// 				samplesData,
	// 				channelsCount,
	// 				channels        : [0, 2],
	// 				coef            : 0.6,
	// 				separateChannels: false,
	// 			})
	// 		},
	// 	})
	//
	// 	test({
	// 		samplesCount    : 100,
	// 		channelsCount   : 3,
	// 		fillRanges      : [[73, 74]],
	// 		amplitudesActual: [0.1, 0.35, 0.2],
	// 		amplitudesExpect: [0.3, 0.35, 0.6],
	// 		handle(samplesData, channelsCount, samplesCount) {
	// 			normalizeAmplitudeSimple({
	// 				samplesData,
	// 				channelsCount,
	// 				channels        : [0, 2],
	// 				coef            : 0.6,
	// 				separateChannels: false,
	// 			})
	// 		},
	// 	})
	//
	// 	test({
	// 		samplesCount    : 100,
	// 		channelsCount   : 3,
	// 		fillRanges      : [[99, 100]],
	// 		amplitudesActual: [0.1, 0.35, 0.2],
	// 		amplitudesExpect: [0.3, 0.35, 0.6],
	// 		handle(samplesData, channelsCount, samplesCount) {
	// 			normalizeAmplitudeSimple({
	// 				samplesData,
	// 				channelsCount,
	// 				channels        : [0, 2],
	// 				coef            : 0.6,
	// 				separateChannels: false,
	// 			})
	// 		},
	// 	})
	// })
})
