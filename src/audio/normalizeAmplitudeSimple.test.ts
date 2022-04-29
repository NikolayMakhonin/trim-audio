/* eslint-disable @typescript-eslint/no-shadow */
import {normalizeAmplitudeSimple} from './normalizeAmplitudeSimple'
import {generateSamples, SamplesPattern} from './test/generateSamples'
import {createTestVariants} from '../test/createTestVariants'
import {testSamples} from './test/testSamples'

describe('node > normalizeAmplitudeSimple', function () {
	this.timeout(30000)

	const testVariants = createTestVariants(({
		samplesCount,
		channelsCount,
		channels,
		patternsActual,
		patternsExpected,
		coef,
		separateChannels,
	}: {
		samplesCount: number,
		channelsCount: number,
		channels: number[],
		patternsActual: SamplesPattern[][],
		patternsExpected: SamplesPattern[][],
		coef: number,
		separateChannels: boolean,
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

	it('normalizeWithWindow silence 0', function () {
		testVariants({
			samplesCount : [100],
			channelsCount: [1, 2, 3],
			channels     : ({channelsCount}) => channelsCount === 1 ? [[1]]
				: channelsCount === 2 ? [[0, 2]]
					: [[1, 2], [0, 1, 2]],
			patternsActual: ({channels}) => [[
				[['fill', 0, 1, channels.includes(0) ? 0 : 1]],
				[['fill', 0, 1, channels.includes(1) ? 0 : 1]],
				[['fill', 0, 1, channels.includes(2) ? 0 : 1]],
			]],
			patternsExpected: ({channels}) => [[
				[['fill', 0, 1, channels.includes(0) ? 0 : 1]],
				[['fill', 0, 1, channels.includes(1) ? 0 : 1]],
				[['fill', 0, 1, channels.includes(2) ? 0 : 1]],
			]],
			coef            : [0, 1],
			separateChannels: [false, true],
		})
	})

	// it('normalizeWithWindow silence 0.1', function () {
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
	// it('normalizeWithWindow peak', function () {
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
	// it('normalizeWithWindow peak separateChannels', function () {
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
	// it('normalizeWithWindow peak select channels', function () {
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
