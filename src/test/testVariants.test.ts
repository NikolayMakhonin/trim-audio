/* eslint-disable @typescript-eslint/no-shadow */
import {createTestVariants} from './createTestVariants'

describe('test > testVariants', function () {
	it('base', function () {
		const result = []
		createTestVariants(({a, b, c}: {a: number, b: string, c: boolean}) => {
			result.push([a, b, c])
		})({
			a: [1, 2],
			b: ['3', '4'],
			c: [true, false],
		})

		assert.deepStrictEqual(result, [
			[1, '3', true],
			[1, '3', false],
			[1, '4', true],
			[1, '4', false],
			[2, '3', true],
			[2, '3', false],
			[2, '4', true],
			[2, '4', false],
		])
	})

	it('empty end', function () {
		const result = []
		createTestVariants(({a, b, c}: {a: number, b: string, c: boolean}) => {
			result.push([a, b, c])
		})({
			a: [1, 2],
			b: ['3', '4'],
			c: [],
		})

		assert.deepStrictEqual(result, [])
	})

	it('empty middle', function () {
		const result = []
		createTestVariants(({a, b, c}: {a: number, b: string, c: boolean}) => {
			result.push([a, b, c])
		})({
			a: [1, 2],
			b: [],
			c: [false, true],
		})

		assert.deepStrictEqual(result, [])
	})

	it('empty start', function () {
		const result = []
		createTestVariants(({a, b, c}: {a: number, b: string, c: boolean}) => {
			result.push([a, b, c])
		})({
			a: [],
			b: ['3', '4'],
			c: [false, true],
		})

		assert.deepStrictEqual(result, [])
	})

	it('calculated', function () {
		const result = []
		createTestVariants(({a, b, c}: {a: number, b: string, c: boolean}) => {
			result.push([a, b, c])
		})({
			a: () => [1, 2],
			b: ({a}) => a === 1 ? ['2', '3', '4'] : ['2'],
			c: ({b}) => b === '2' ? [false, true]
				: b === '3' ? []
					: [true],
		})

		assert.deepStrictEqual(result, [
			[1, '2', false],
			[1, '2', true],
			[1, '4', true],
			[2, '2', false],
			[2, '2', true],
		])
	})
})
