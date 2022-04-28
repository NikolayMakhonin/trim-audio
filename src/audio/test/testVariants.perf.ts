import { calcPerformance } from 'rdtsc'
import {testVariants, testVariants2} from './testVariants'

describe('node > testVariants', function () {
	this.timeout(300000)

	it('perf', function () {
		const result = calcPerformance(
			100000,
			() => {

			},
			() => {
				testVariants([
					[1, 2],
					['3', '4'],
					[true, false],
				], (a: number, b: string, c: boolean) => {
					return a === 1 && b === '4' && c === false
				})
			},
			() => {
				testVariants2({
					a: [1, 2],
					b: ['3', '4'],
					c: [true, false],
				}, ({a, b, c}) => {
					return a === 1 && b === '4' && c === false
				})
			},
		)

		console.log('testVariants perf: ', result)
	})
})
