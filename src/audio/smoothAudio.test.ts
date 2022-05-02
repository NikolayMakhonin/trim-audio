/* eslint-disable @typescript-eslint/no-shadow */
import {SamplesPattern} from './test/generateSamples'
import {createTestVariants} from '../test/createTestVariants'
import {testSamplesWithPatterns} from './test/testSamples'
import {mapChannels} from './test/mapChannels'
import {smoothAudio} from './smoothAudio'

describe('audio > smoothAudio', function () {
	this.timeout(30000)

	const testVariants = createTestVariants(({
		samplesCount,
		channelsCount,
		channels,
		startSamples,
		endSamples,
		patternsActual,
		patternsExpect,
	}: {
		samplesCount: number,
		channelsCount: number,
		channels: number[],
		startSamples: number,
		endSamples: number,
		patternsActual: SamplesPattern[][],
		patternsExpect: SamplesPattern[][],
	}) => {
		testSamplesWithPatterns({
			actual: {
				samplesCount,
				channelsCount,
				patterns: patternsActual,
			},
			expect: {
				samplesCount,
				channelsCount,
				patterns: patternsExpect,
			},
			handle(samplesData, channelsCount, samplesCount) {
				return smoothAudio({
					samplesData,
					channelsCount,
					channels,
					startSamples,
					endSamples,
				})
			},
		})
	})

	it('base', function () {
		testVariants({
			samplesCount : [100],
			channelsCount: [1, 2, 3],
			channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1]]
					: [[0, 2], [1, 2], [0, 1, 2]],
			startSamples  : [0],
			endSamples    : [0],
			patternsActual: ({channelsCount, channels}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', 0, 100, 1],
				]),
			],
			patternsExpect: ({channelsCount, channels}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill-noise', 0, 100, 1],
				]),
			],
		})
	})
})
