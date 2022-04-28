import { calcPerformance } from 'rdtsc'
import {testVariants} from './testVariants'

describe('node > testVariants', function () {
	this.timeout(30000)

	it('base', function () {
		const result = calcPerformance(
			10000,
			() => {

			},
			() => {
				testVariants([
					[1, 2],
					['3', '4'],
					[true, false],
				], (a: number, b: string, c: boolean) => {

				})
			},
			() => {
				testVariants([
					[1, 2],
					['3', '4'],
					[true, false],
				], (a: number, b: string, c: boolean) => {

				})
			},
		)

		console.log('testVariants perf: ', result)
	})
})
