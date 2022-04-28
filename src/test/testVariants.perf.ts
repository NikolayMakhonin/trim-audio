import { calcPerformance } from 'rdtsc'
import {testVariants} from './testVariants'

describe('test > testVariants perf', function () {
	this.timeout(300000)

	it('perf', function () {
		const result = calcPerformance(
			10000,
			() => {

			},
			() => {
				testVariants({
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
