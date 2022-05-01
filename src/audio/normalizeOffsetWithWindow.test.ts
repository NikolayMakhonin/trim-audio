/* eslint-disable @typescript-eslint/no-shadow */
import {SamplesPattern} from './test/generateSamples'
import {createTestVariants} from '../test/createTestVariants'
import {testSamplesWithPatterns} from './test/testSamples'
import {mapChannels} from './test/mapChannels'
import {normalizeOffsetWithWindow} from './normalizeOffsetWithWindow'

describe('node > normalizeOffsetWithWindow', function () {
	this.timeout(30000)

	const testVariants = createTestVariants(({
		samplesCount,
		channelsCount,
		channels,
		windowSamples,
		patternsActual,
		patternsExpected,
	}: {
		samplesCount: number,
		channelsCount: number,
		channels: number[],
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
			handle(samplesData, channelsCount) {
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
			windowSamples : [2, 1, 3, 7, 20, 50],
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

	it('silence 1', function () {
		testVariants({
			samplesCount : [100],
			channelsCount: [1, 2, 3],
			channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1]]
					: [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
			windowSamples : [2, 1, 3, 7, 20, 50],
			amplitude     : [0, 1, 0.5, -1, -0.25],
			patternsActual: ({channelsCount, channels, amplitude}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0.2 * amplitude : 0.1],
				]),
			],
			patternsExpected: ({channelsCount, channels, amplitude}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0 : 0.1],
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
			windowSamples : [10, 2, 3, 1, 7, 20, 50],
			amplitude     : [1, 0, 0.5, -1, -0.25],
			patternsActual: ({channelsCount, channels, amplitude}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
					['fill', 0, 1, active ? 0.1 * amplitude : 0],
				]),
			],
			patternsExpected: ({channelsCount, channels, amplitude, windowSamples}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
					['fill', 0, 1, active ? 0.1 * amplitude : 0],
					['fill', 0, Math.ceil(windowSamples / 2), active ? -((0.1 * windowSamples + 0.1) / windowSamples) * amplitude : 0],
					['fill', Math.ceil(windowSamples / 2), windowSamples + Math.ceil(windowSamples / 2), active ? -((0.1 * windowSamples + 0.1) / windowSamples) * amplitude : 0, active ? -0.1 * amplitude : 0],
					['fill', windowSamples + Math.ceil(windowSamples / 2), 100, active ? -0.1 * amplitude : 0],
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
			windowSamples : [10, 2, 1, 4, 5, 20, 25, 50],
			amplitude     : [0, 1, 0.5, -1, -0.25],
			patternsActual: ({channelsCount, channels, amplitude}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
					['fill', 99, 100, active ? 0.1 * amplitude : 0],
				]),
			],
			patternsExpected: ({channelsCount, channels, amplitude, windowSamples}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
					['fill', 99, 100, active ? 0.1 * amplitude : 0],
					['fill', 100 - windowSamples + Math.ceil(windowSamples / 2), 100, active ? -((0.1 * windowSamples + 0.1) / windowSamples) * amplitude : 0],
					['fill', 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), 100 - windowSamples + Math.ceil(windowSamples / 2), active ? -0.1 * amplitude : 0, active ? -((0.1 * windowSamples + 0.1) / windowSamples) * amplitude : 0],
					['fill', 0, 100 - 2 * windowSamples + Math.ceil(windowSamples / 2), active ? -0.1 * amplitude : 0],
				]),
			],
		})
	})

	it('peak middle', function () {
		testVariants({
			windowSamples: [10, 2, 1, 5, 25],
			samplesCount : [100],
			channelsCount: [1, 2, 3],
			channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1], [0], [1]]
					: [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
			amplitude     : [0, 1, 0.5, -1, -0.25],
			patternsActual: ({channelsCount, channels, amplitude}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
					['fill', 50, 51, active ? 0.1 * amplitude : 0],
				]),
			],
			patternsExpected: ({channelsCount, channels, amplitude, windowSamples}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0.1 * amplitude : 0.1],
					['fill', 50, 51, active ? 0.1 * amplitude : 0],

					['fill', 0, 50 - windowSamples + Math.ceil(windowSamples / 2), active ? -0.1 * amplitude : 0],
					['fill', 50 - windowSamples + Math.ceil(windowSamples / 2), 50 + Math.ceil(windowSamples / 2), active ? -0.1 * amplitude : 0, active ? -((0.1 * windowSamples + 0.1) / windowSamples) * amplitude : 0],
					['fill', 50 + Math.ceil(windowSamples / 2), 50 + windowSamples + Math.ceil(windowSamples / 2), active ? -((0.1 * windowSamples + 0.1) / windowSamples) * amplitude : 0, active ? -0.1 * amplitude : 0],
					['fill', 50 + windowSamples + Math.ceil(windowSamples / 2), 100, active ? -0.1 * amplitude : 0],
				]),
			],
		})
	})
})
