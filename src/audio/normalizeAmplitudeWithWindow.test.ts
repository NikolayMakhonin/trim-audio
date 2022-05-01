/* eslint-disable @typescript-eslint/no-shadow */
import {normalizeOffsetWithWindow} from './normalizeOffsetWithWindow'
import {generateSamples, SamplesPattern} from './test/generateSamples'
import {createTestVariants} from '../test/createTestVariants'
import {testSamples, testSamplesWithPatterns} from './test/testSamples'
import {mapChannels} from './test/mapChannels'
import {saveTempFile} from './test/saveTempFile'
import {saveTempFileMp3, saveTempFileWav} from './test/saveTempFileMp3'
import {loadAssetAudio} from './test/loadAssetAudio'
import {normalizeAmplitudeSimple} from './normalizeAmplitudeSimple'

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
		testSamplesWithPatterns({
			samplesCount,
			channelsCount,
			maxDiff: 1e-7,
			patternsActual,
			patternsExpected,
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

	it('silence', function () {
		testVariants({
			samplesCount : [100],
			channelsCount: [1, 2, 3],
			channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1]]
					: [[0, 2], [1, 2], [0, 1, 2]],
			windowSamples : [2, 1, 3, 7, 20, 90, 98, 99, 100],
			offset        : [0, 0.3, 1],
			amplitude     : [0, 1, 0.5, -1, -0.25],
			patternsActual: ({channelsCount, channels, offset, amplitude}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? offset * amplitude : (1 + offset) * amplitude],
				]),
			],
			patternsExpected: ({channelsCount, channels, offset, amplitude}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0 : (1 + offset) * amplitude],
				]),
			],
		})
	})

	it('peak start/end', function () {
		testVariants({
			samplesCount : [100],
			channelsCount: [1, 2, 3],
			channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1]]
					: [[0, 2], [1, 2], [0, 1, 2]],
			windowSamples : [2, 1, 3, 7, 20, 50, 60, 99],
			offset        : [0, 0.3, 1],
			amplitude     : [0, 1, 0.5, -1, -0.25],
			patternsActual: ({channelsCount, channels, offset, amplitude}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, offset * amplitude],
					['fill', 0, 1, active ? amplitude : 0],
					['fill', 99, 100, active ? 0.5 * amplitude : 0],
				]),
			],
			patternsExpected: ({channelsCount, channels, offset, amplitude, windowSamples}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, offset * amplitude],
					['fill', 0, 1, active ? amplitude : 0],
					['fill', 99, 100, active ? 0.5 * amplitude : 0],

					['fill', 0, Math.ceil(windowSamples / 2), active ? -amplitude * ((1 + offset) + offset * (windowSamples - 1)) / windowSamples : 0],
					['fill', Math.ceil(windowSamples / 2), 100 - windowSamples + Math.ceil(windowSamples / 2) - 1, active ? -offset * amplitude : 0],
					['fill', Math.max(
						Math.ceil(windowSamples / 2),
						100 - windowSamples + Math.ceil(windowSamples / 2) - 1,
					), 100, active ? -amplitude * ((0.5 + offset) + offset * (windowSamples - 1)) / windowSamples : 0],
				]),
			],
		})
	})

	xit('test', async function () {
		const audio = await loadAssetAudio('word2.mp3')
		const samplesData = new Float32Array(1000 * 2)
		generateSamples({
			samplesData,
			channelsCount: 2,
			patterns     : [
				[['fill', 0, 1, 1]],
				[],
			],
		})
		normalizeOffsetWithWindow({
			samplesData: audio.data,
			channelsCount: audio.channels,
			channels     : [0],
			windowSamples: 44100 * 0.5,
		})
		normalizeAmplitudeSimple({
			samplesData: audio.data,
			channelsCount: audio.channels,
			channels: [1],
			separateChannels: true,
			coef: 1,
		})
		await saveTempFileWav('test.wav', {
			data      : audio.data,
			channels  : audio.channels,
			sampleRate: 44100,
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
