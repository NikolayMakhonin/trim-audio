/* eslint-disable @typescript-eslint/no-shadow */
import {normalizeAmplitudeSimple} from './normalizeAmplitudeSimple'
import {generateSamples, SamplesPattern} from './test/generateSamples'
import {createTestVariants} from '../test/createTestVariants'
import {testSamples} from './test/testSamples'
import {mapChannels} from './test/mapChannels'

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

	it('silence 0', function () {
		testVariants({
			samplesCount : [100],
			channelsCount: [1, 2, 3],
			channels     : ({channelsCount}) => channelsCount === 1 ? [[1]]
				: channelsCount === 2 ? [[0, 1]]
					: [[0, 2], [1, 2], [0, 1, 2]],
			coef            : [0, 1],
			separateChannels: [false, true],
			patternsActual  : ({channelsCount, channels}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 1, active ? 0 : 1],
				]),
			],
			patternsExpected: ({channelsCount, channels}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 1, active ? 0 : 1],
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
			coef            : [0.6],
			separateChannels: [false, true],
			patternsActual  : ({channelsCount, channels}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0.2 : 0.1],
				]),
			],
			patternsExpected: ({channelsCount, channels}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0.6 : 0.1],
				]),
			],
		})
	})

	it('peak', function () {
		testVariants({
			samplesCount : [100],
			channelsCount: [1, 2, 3],
			channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1]]
					: [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
			coef            : [0.6],
			separateChannels: [false, true],
			position        : [0, 73, 99],
			patternsActual  : ({channelsCount, channels, position}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, 0.1], ['fill', position, position + 1, active ? 0.1 : 0],
				]),
			],
			patternsExpected: ({channelsCount, channels, position}) => [
				mapChannels(channelsCount, channels, (channel, active) => [
					['fill', 0, 100, active ? 0.3 : 0.1], ['fill', position, position + 1, active ? 0.3 : 0],
				]),
			],
		})
	})

	it('separateChannels', function () {
		testVariants({
			samplesCount : [100],
			channelsCount: [1, 2, 3],
			channels     : ({channelsCount}) => channelsCount === 1 ? [[0]]
				: channelsCount === 2 ? [[0, 1]]
					: [[], [0], [1], [2], [0, 2], [1, 2], [0, 1, 2]],
			coef            : [0.6],
			separateChannels: [true],
			patternsActual  : ({channels}) => [
				[
					[['fill', 0, 100, 0.1], ['fill', 0, 1, channels.includes(0) ? 0.1 : 0]],
					[['fill', 0, 100, 0.1], ['fill', 0, 1, channels.includes(1) ? 0.2 : 0]],
					[['fill', 0, 100, 0.1], ['fill', 0, 1, channels.includes(2) ? 0.3 : 0]],
				],
				[
					[['fill', 0, 100, 0.1], ['fill', 73, 74, channels.includes(0) ? 0.1 : 0]],
					[['fill', 0, 100, 0.1], ['fill', 73, 74, channels.includes(1) ? 0.2 : 0]],
					[['fill', 0, 100, 0.1], ['fill', 73, 74, channels.includes(2) ? 0.3 : 0]],
				],
				[
					[['fill', 0, 100, 0.1], ['fill', 99, 100, channels.includes(0) ? 0.1 : 0]],
					[['fill', 0, 100, 0.1], ['fill', 99, 100, channels.includes(1) ? 0.2 : 0]],
					[['fill', 0, 100, 0.1], ['fill', 99, 100, channels.includes(2) ? 0.3 : 0]],
				],
			],
			patternsExpected: ({channels}) => [
				[
					[['fill', 0, 100, channels.includes(0) ? 0.3 : 0.1], ['fill', 0, 1, channels.includes(0) ? 0.3 : 0]],
					[['fill', 0, 100, channels.includes(1) ? 0.2 : 0.1], ['fill', 0, 1, channels.includes(1) ? 0.4 : 0]],
					[['fill', 0, 100, channels.includes(2) ? 0.15 : 0.1], ['fill', 0, 1, channels.includes(2) ? 0.45 : 0]],
				],
				[
					[['fill', 0, 100, channels.includes(0) ? 0.3 : 0.1], ['fill', 73, 74, channels.includes(0) ? 0.3 : 0]],
					[['fill', 0, 100, channels.includes(1) ? 0.2 : 0.1], ['fill', 73, 74, channels.includes(1) ? 0.4 : 0]],
					[['fill', 0, 100, channels.includes(2) ? 0.15 : 0.1], ['fill', 73, 74, channels.includes(2) ? 0.45 : 0]],
				],
				[
					[['fill', 0, 100, channels.includes(0) ? 0.3 : 0.1], ['fill', 99, 100, channels.includes(0) ? 0.3 : 0]],
					[['fill', 0, 100, channels.includes(1) ? 0.2 : 0.1], ['fill', 99, 100, channels.includes(1) ? 0.4 : 0]],
					[['fill', 0, 100, channels.includes(2) ? 0.15 : 0.1], ['fill', 99, 100, channels.includes(2) ? 0.45 : 0]],
				],
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
			coef            : [0.6],
			separateChannels: [false],
			patternsActual  : ({channels}) => [
				[
					[['fill', 0, 100, 0.1], ['fill', 0, 1, channels.includes(0) ? 0.3 : 0]],
					[['fill', 0, 100, 0.1], ['fill', 0, 1, channels.includes(1) ? 0.2 : 0]],
					[['fill', 0, 100, 0.1], ['fill', 0, 1, channels.includes(2) ? 0.1 : 0]],
				],
				[
					[['fill', 0, 100, 0.1], ['fill', 73, 74, channels.includes(0) ? 0.3 : 0]],
					[['fill', 0, 100, 0.1], ['fill', 73, 74, channels.includes(1) ? 0.2 : 0]],
					[['fill', 0, 100, 0.1], ['fill', 73, 74, channels.includes(2) ? 0.1 : 0]],
				],
				[
					[['fill', 0, 100, 0.1], ['fill', 99, 100, channels.includes(0) ? 0.3 : 0]],
					[['fill', 0, 100, 0.1], ['fill', 99, 100, channels.includes(1) ? 0.2 : 0]],
					[['fill', 0, 100, 0.1], ['fill', 99, 100, channels.includes(2) ? 0.1 : 0]],
				],
			],
			patternsExpected: ({channels}) => [
				[
					[['fill', 0, 100, channels.includes(0) ? 0.15 : 0.1], ['fill', 0, 1, channels.includes(0) ? 0.45 : 0]],
					[['fill', 0, 100, channels.includes(1) ? 0.15 : 0.1], ['fill', 0, 1, channels.includes(1) ? 0.3 : 0]],
					[['fill', 0, 100, channels.includes(2) ? 0.15 : 0.1], ['fill', 0, 1, channels.includes(2) ? 0.15 : 0]],
				],
				[
					[['fill', 0, 100, channels.includes(0) ? 0.15 : 0.1], ['fill', 73, 74, channels.includes(0) ? 0.45 : 0]],
					[['fill', 0, 100, channels.includes(1) ? 0.15 : 0.1], ['fill', 73, 74, channels.includes(1) ? 0.3 : 0]],
					[['fill', 0, 100, channels.includes(2) ? 0.15 : 0.1], ['fill', 73, 74, channels.includes(2) ? 0.15 : 0]],
				],
				[
					[['fill', 0, 100, channels.includes(0) ? 0.15 : 0.1], ['fill', 99, 100, channels.includes(0) ? 0.45 : 0]],
					[['fill', 0, 100, channels.includes(1) ? 0.15 : 0.1], ['fill', 99, 100, channels.includes(1) ? 0.3 : 0]],
					[['fill', 0, 100, channels.includes(2) ? 0.15 : 0.1], ['fill', 99, 100, channels.includes(2) ? 0.15 : 0]],
				],
			],
		})
	})
})
