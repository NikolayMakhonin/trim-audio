/* eslint-disable @typescript-eslint/no-shadow */
import {testVariants, testVariants2} from './testVariants'

describe('node > testVariants', function () {
	it('1', function () {
		const result = []
		testVariants([
			[1, 2],
			['3', '4'],
			[true, false],
		], (a: number, b: string, c: boolean) => {
			result.push([a, b, c])
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

	it('2', function () {
		const result = []
		testVariants2({
			a: [1, 2],
			b: ['3', '4'],
			c: [true, false],
		}, ({a, b, c}) => {
			result.push([a, b, c])
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
})
