/* eslint-disable @typescript-eslint/no-shadow */
import {normalizeAmplitudeSimple} from './normalizeAmplitudeSimple'
import {generateSilence} from './test/generateSamples'
import {testSamples} from './test/testSamples'
import {testVariants} from '../test/testVariants'

describe('node > normalizeAmplitudeSimple', function () {
	this.timeout(30000)

	function test({
		samplesCount,
		channelsCount,
		fillRanges,
		amplitudesActual,
		amplitudesExpect,
		handle,
	}: {
		samplesCount : number,
		channelsCount: number,
		fillRanges: [number, number][],
		amplitudesActual: number[],
		amplitudesExpect: number[],
		handle: (samplesData: Float32Array, channelsCount: number, samplesCount: number) => void,
	}) {
		testSamples({
			samplesCount,
			channelsCount,
			maxDiff: 1e-7,
			fillData(samplesDataActual, samplesDataExpect, channelsCount, samplesCount) {
				for (let channel = 0; channel < channelsCount; channel++) {
					const amplitudeActual = amplitudesActual[channel]
					const amplitudeExpect = amplitudesExpect[channel]

					for (let i = 0; i < fillRanges.length; i++) {
						const fillRange = fillRanges[i]
						generateSilence({
							samplesData : samplesDataActual,
							channelsCount,
							channel,
							start       : fillRange[0],
							endExclusive: fillRange[1],
							amplitude   : amplitudeActual,
						})
						generateSilence({
							samplesData : samplesDataExpect,
							channelsCount,
							channel,
							start       : fillRange[0],
							endExclusive: fillRange[1],
							amplitude   : amplitudeExpect,
						})
					}
				}
			},
			handle,
		})
	}

	it('normalizeWithWindow silence 0', function () {
		testVariants({
			channelsCount: [1, 2, 3],
			channels     : ({channelsCount}) => channelsCount === 1 ? [[1]]
				: channelsCount === 2 ? [[0, 2]]
				: [[1, 2], [0, 1, 2]],
			coef            : [0, 1],
			separateChannels: [false, true],
		}, ({channelsCount, channels, coef, separateChannels}) => {
			test({
				samplesCount    : 100,
				channelsCount,
				fillRanges      : [[0, 1]],
				amplitudesActual: [0, 0, 0],
				amplitudesExpect: [0, 0, 0],
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
	})

	it('normalizeWithWindow silence 0.1', function () {
		test({
			samplesCount    : 100,
			channelsCount   : 3,
			fillRanges      : [[0, 100]],
			amplitudesActual: [0.1, 0.1, 0.1],
			amplitudesExpect: [0.6, 0.6, 0.6],
			handle(samplesData, channelsCount, samplesCount) {
				normalizeAmplitudeSimple({
					samplesData,
					channelsCount,
					channels        : [0, 1, 2],
					coef            : 0.6,
					separateChannels: false,
				})
			},
		})

		test({
			samplesCount    : 100,
			channelsCount   : 3,
			fillRanges      : [[0, 100]],
			amplitudesActual: [0.1, 0.3, 0.2],
			amplitudesExpect: [0.2, 0.6, 0.4],
			handle(samplesData, channelsCount, samplesCount) {
				normalizeAmplitudeSimple({
					samplesData,
					channelsCount,
					channels        : [0, 1, 2],
					coef            : 0.6,
					separateChannels: false,
				})
			},
		})
	})

	it('normalizeWithWindow peak', function () {
		test({
			samplesCount    : 100,
			channelsCount   : 3,
			fillRanges      : [[0, 1]],
			amplitudesActual: [0.1, 0.3, 0.2],
			amplitudesExpect: [0.2, 0.6, 0.4],
			handle(samplesData, channelsCount, samplesCount) {
				normalizeAmplitudeSimple({
					samplesData,
					channelsCount,
					channels        : [0, 1, 2],
					coef            : 0.6,
					separateChannels: false,
				})
			},
		})

		test({
			samplesCount    : 100,
			channelsCount   : 3,
			fillRanges      : [[99, 100]],
			amplitudesActual: [0.1, 0.3, 0.2],
			amplitudesExpect: [0.2, 0.6, 0.4],
			handle(samplesData, channelsCount, samplesCount) {
				normalizeAmplitudeSimple({
					samplesData,
					channelsCount,
					channels        : [0, 1, 2],
					coef            : 0.6,
					separateChannels: false,
				})
			},
		})

		test({
			samplesCount    : 100,
			channelsCount   : 3,
			fillRanges      : [[73, 74]],
			amplitudesActual: [0.1, 0.3, 0.2],
			amplitudesExpect: [0.2, 0.6, 0.4],
			handle(samplesData, channelsCount, samplesCount) {
				normalizeAmplitudeSimple({
					samplesData,
					channelsCount,
					channels        : [0, 1, 2],
					coef            : 0.6,
					separateChannels: false,
				})
			},
		})
	})

	it('normalizeWithWindow peak separateChannels', function () {
		test({
			samplesCount    : 100,
			channelsCount   : 3,
			fillRanges      : [[0, 1]],
			amplitudesActual: [0.1, 0.3, 0.2],
			amplitudesExpect: [0.6, 0.6, 0.6],
			handle(samplesData, channelsCount, samplesCount) {
				normalizeAmplitudeSimple({
					samplesData,
					channelsCount,
					channels        : [0, 1, 2],
					coef            : 0.6,
					separateChannels: true,
				})
			},
		})

		test({
			samplesCount    : 100,
			channelsCount   : 3,
			fillRanges      : [[99, 100]],
			amplitudesActual: [0.1, 0.3, 0.2],
			amplitudesExpect: [0.6, 0.6, 0.6],
			handle(samplesData, channelsCount, samplesCount) {
				normalizeAmplitudeSimple({
					samplesData,
					channelsCount,
					channels        : [0, 1, 2],
					coef            : 0.6,
					separateChannels: true,
				})
			},
		})

		test({
			samplesCount    : 100,
			channelsCount   : 3,
			fillRanges      : [[73, 74]],
			amplitudesActual: [0.1, 0.3, 0.2],
			amplitudesExpect: [0.6, 0.6, 0.6],
			handle(samplesData, channelsCount, samplesCount) {
				normalizeAmplitudeSimple({
					samplesData,
					channelsCount,
					channels        : [0, 1, 2],
					coef            : 0.6,
					separateChannels: true,
				})
			},
		})
	})

	it('normalizeWithWindow peak select channels', function () {
		test({
			samplesCount    : 100,
			channelsCount   : 3,
			fillRanges      : [[0, 1]],
			amplitudesActual: [0.1, 0.35, 0.2],
			amplitudesExpect: [0.3, 0.35, 0.6],
			handle(samplesData, channelsCount, samplesCount) {
				normalizeAmplitudeSimple({
					samplesData,
					channelsCount,
					channels        : [0, 2],
					coef            : 0.6,
					separateChannels: false,
				})
			},
		})

		test({
			samplesCount    : 100,
			channelsCount   : 3,
			fillRanges      : [[73, 74]],
			amplitudesActual: [0.1, 0.35, 0.2],
			amplitudesExpect: [0.3, 0.35, 0.6],
			handle(samplesData, channelsCount, samplesCount) {
				normalizeAmplitudeSimple({
					samplesData,
					channelsCount,
					channels        : [0, 2],
					coef            : 0.6,
					separateChannels: false,
				})
			},
		})

		test({
			samplesCount    : 100,
			channelsCount   : 3,
			fillRanges      : [[99, 100]],
			amplitudesActual: [0.1, 0.35, 0.2],
			amplitudesExpect: [0.3, 0.35, 0.6],
			handle(samplesData, channelsCount, samplesCount) {
				normalizeAmplitudeSimple({
					samplesData,
					channelsCount,
					channels        : [0, 2],
					coef            : 0.6,
					separateChannels: false,
				})
			},
		})
	})
})
