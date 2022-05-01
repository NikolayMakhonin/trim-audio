/* eslint-disable @typescript-eslint/no-shadow */
import {SamplesPattern} from './test/generateSamples'
import {createTestVariants} from '../test/createTestVariants'
import {testSamplesWithPatterns} from './test/testSamples'
import {mapChannels} from './test/mapChannels'
import {normalizeAmplitudeWithWindow} from './normalizeAmplitudeWithWindow'
import {sign} from './test/sign'

describe('node > normalizeAmplitudeWithWindow', function () {
	this.timeout(30000)

	const testVariants = createTestVariants(({
		samplesCount,
		channelsCount,
		channels,
		separateChannels,
		amplitude,
		offset,
		coef,
		windowSamples,
		patternsActual,
		patternsExpected,
	}: {
		samplesCount: number,
		channelsCount: number,
		channels: number[],
		separateChannels?: boolean,
		amplitude: boolean,
		offset: boolean,
		coef: number,
		windowSamples: number,
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
				normalizeAmplitudeWithWindow({
					samplesData,
					channelsCount,
					channels,
					separateChannels,
					amplitude,
					offset,
					coef,
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
			amplitude       : [true],
			offset          : [false],
			windowSamples   : [2, 1, 3, 7, 20, 50], // 90, 98, 99, 100],
			coef            : [0, 1],
			separateChannels: [false, true],
			amplitudeMult   : [0, 1, 0.5, -1, -0.25],
			patternsActual  : ({channelsCount, channels, amplitudeMult}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 1, active ? 0 : amplitudeMult],
				]),
			],
			patternsExpected: ({channelsCount, channels, amplitudeMult}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 1, active ? 0 : amplitudeMult],
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
			amplitude       : [true],
			offset          : [false],
			windowSamples   : [2, 1, 3, 7, 20, 50], // 90, 98, 99, 100],
			coef            : [0.6],
			separateChannels: [false, true],
			amplitudeMult   : [0, 1, 0.5, -1, -0.25],
			patternsActual  : ({channelsCount, channels, amplitudeMult}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0.2 * amplitudeMult : 0.1],
				]),
			],
			patternsExpected: ({channelsCount, channels, amplitudeMult}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0.6 * sign(amplitudeMult) : 0.1],
				]),
			],
		})
	})

	it('peak start', function () {
		testVariants({
			samplesCount : [100],
			channelsCount: [1, 2, 3],
			channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1], [0], [1]]
					: [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
			amplitude       : [true],
			offset          : [false],
			windowSamples   : [10, 2, 1, 3, 7, 20, 50], // 90, 98, 99, 100],
			coef            : [0.6],
			separateChannels: [false, true],
			amplitudeMult   : [1, 0, 0.5, -1, -0.25],
			patternsActual  : ({channelsCount, channels, amplitudeMult}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0.1 * amplitudeMult : 0.1],
					['fill', 0, 1, active ? 0.1 * amplitudeMult : 0],
				]),
			],
			patternsExpected: ({channelsCount, channels, amplitudeMult, windowSamples}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 1, active ? 0.6 * sign(amplitudeMult) : 0.1],
					['fill', 1, windowSamples, active ? 0.3 * sign(amplitudeMult) : 0.1],
					['fill', windowSamples, windowSamples + Math.ceil(windowSamples / 2), active ? 0.3 * sign(amplitudeMult) : 0.1, active ? 0.6 * sign(amplitudeMult) : 0.1],
					['fill', windowSamples + Math.ceil(windowSamples / 2), 100, active ? 0.6 * sign(amplitudeMult) : 0.1],
				]),
			],
		})
	})

	it('peak end', function () {
		testVariants({
			samplesCount : [100],
			channelsCount: [1, 2, 3],
			channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1], [0], [1]]
					: [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
			amplitude       : [true],
			offset          : [false],
			windowSamples   : [10, 2, 1, 4, 5, 20, 25, 50], // 90, 98, 99, 100],
			coef            : [0.6],
			separateChannels: [false, true],
			amplitudeMult   : [0, 1, 0.5, -1, -0.25],
			patternsActual  : ({channelsCount, channels, amplitudeMult}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0.1 * amplitudeMult : 0.1],
					['fill', 99, 100, active ? 0.1 * amplitudeMult : 0],
				]),
			],
			patternsExpected: ({channelsCount, channels, amplitudeMult, windowSamples}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 99, 100, active ? 0.6 * sign(amplitudeMult) : 0.1],
					['fill', 100 - windowSamples, 99, active ? 0.3 * sign(amplitudeMult) : 0.1],
					['fill', 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), 100 - windowSamples, active ? 0.6 * sign(amplitudeMult) : 0.1, active ? 0.3 * sign(amplitudeMult) : 0.1],
					['fill', 0, 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), active ? 0.6 * sign(amplitudeMult) : 0.1],
				]),
			],
		})
	})

	it('peak', function () {
		testVariants({
			samplesCount : [100],
			channelsCount: [1, 2, 3],
			channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1], [0], [1]]
					: [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
			amplitude       : [true],
			offset          : [false],
			windowSamples   : [10, 2, 1, 4, 5, 20, 25], // 90, 98, 99, 100],
			coef            : [0.6],
			separateChannels: [false, true],
			amplitudeMult   : [0, 1, 0.5, -1, -0.25],
			patternsActual  : ({channelsCount, channels, amplitudeMult}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0.1 * amplitudeMult : 0.1],
					['fill', 0, 1, active ? 0.1 * amplitudeMult : 0],
					['fill', 99, 100, active ? 0.1 * amplitudeMult : 0],
				]),
			],
			patternsExpected: ({channelsCount, channels, amplitudeMult, windowSamples}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 1, active ? 0.6 * sign(amplitudeMult) : 0.1],
					['fill', 1, windowSamples, active ? 0.3 * sign(amplitudeMult) : 0.1],
					['fill', windowSamples, windowSamples + Math.ceil(windowSamples / 2), active ? 0.3 * sign(amplitudeMult) : 0.1, active ? 0.6 * sign(amplitudeMult) : 0.1],
					['fill', windowSamples + Math.ceil(windowSamples / 2), 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), active ? 0.6 * sign(amplitudeMult) : 0.1],
					['fill', 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), 100 - windowSamples, active ? 0.6 * sign(amplitudeMult) : 0.1, active ? 0.3 * sign(amplitudeMult) : 0.1],
					['fill', 100 - windowSamples, 99, active ? 0.3 * sign(amplitudeMult) : 0.1],
					['fill', 99, 100, active ? 0.6 * sign(amplitudeMult) : 0.1],
				]),
			],
		})
	})

	it('separateChannels', function () {
		testVariants({
			samplesCount : [100],
			channelsCount: [1, 2, 3],
			channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1], [0], [1]]
					: [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
			amplitude       : [true],
			offset          : [false],
			windowSamples   : [10, 2, 1, 4, 5, 20, 25], // 90, 98, 99, 100],
			coef            : [0.6],
			separateChannels: [true],
			amplitudeMult   : [0, 1, 0.5, -1, -0.25],
			patternsActual  : ({channelsCount, channels, amplitudeMult}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? [0.1, 0.2, 0.3][channel] * amplitudeMult : 0.1],
					['fill', 0, 1, active ? [0.1, 0.2, 0.3][channel] * amplitudeMult : 0],
					['fill', 99, 100, active ? [0.1, 0.2, 0.3][channel] * amplitudeMult : 0],
				]),
			],
			patternsExpected: ({channelsCount, channels, amplitudeMult, windowSamples}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					// ['fill', 0, 100, active ? [0.3, 0.2, 0.15][channel] * sign(amplitudeMult) : 0.1],
					// ['fill', position, position + 1, active ? [0.3, 0.4, 0.45][channel] * sign(amplitudeMult) : 0],

					['fill', 0, 1, active ? 0.6 * sign(amplitudeMult) : 0.1],
					['fill', 1, windowSamples, active ? 0.3 * sign(amplitudeMult) : 0.1],
					['fill', windowSamples, windowSamples + Math.ceil(windowSamples / 2), active ? 0.3 * sign(amplitudeMult) : 0.1, active ? 0.6 * sign(amplitudeMult) : 0.1],
					['fill', windowSamples + Math.ceil(windowSamples / 2), 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), active ? 0.6 * sign(amplitudeMult) : 0.1],
					['fill', 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), 100 - windowSamples, active ? 0.6 * sign(amplitudeMult) : 0.1, active ? 0.3 * sign(amplitudeMult) : 0.1],
					['fill', 100 - windowSamples, 99, active ? 0.3 * sign(amplitudeMult) : 0.1],
					['fill', 99, 100, active ? 0.6 * sign(amplitudeMult) : 0.1],
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
			amplitude       : [true],
			offset          : [false],
			windowSamples   : [10, 2, 1, 4, 5, 20, 25], // 90, 98, 99, 100],
			coef            : [0.6],
			separateChannels: [false],
			amplitudeMult   : [0, 1, 0.5, -1, -0.25],
			patternsActual  : ({channelsCount, channels, amplitudeMult}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? [0.3, 0.2, 0.1][channel] * amplitudeMult : 0.1],
					['fill', 0, 1, active ? [0.3, 0.2, 0.1][channel] * amplitudeMult : 0],
					['fill', 99, 100, active ? [0.3, 0.2, 0.1][channel] * amplitudeMult : 0],
				]),
			],
			patternsExpected: ({channelsCount, channels, amplitudeMult, windowSamples}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 1, active ? [0.6, 0.4, 0.2][channel] * sign(amplitudeMult) : 0.1],
					['fill', 1, windowSamples, active ? [0.3, 0.2, 0.1][channel] * sign(amplitudeMult) : 0.1],
					['fill', windowSamples, windowSamples + Math.ceil(windowSamples / 2), active ? [0.3, 0.2, 0.1][channel] * sign(amplitudeMult) : 0.1, active ? [0.6, 0.4, 0.2][channel] * sign(amplitudeMult) : 0.1],
					['fill', windowSamples + Math.ceil(windowSamples / 2), 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), active ? [0.6, 0.4, 0.2][channel] * sign(amplitudeMult) : 0.1],
					['fill', 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), 100 - windowSamples, active ? [0.6, 0.4, 0.2][channel] * sign(amplitudeMult) : 0.1, active ? [0.3, 0.2, 0.1][channel] * sign(amplitudeMult) : 0.1],
					['fill', 100 - windowSamples, 99, active ? [0.3, 0.2, 0.1][channel] * sign(amplitudeMult) : 0.1],
					['fill', 99, 100, active ? [0.6, 0.4, 0.2][channel] * sign(amplitudeMult) : 0.1],
				]),
			],
		})
	})
})
