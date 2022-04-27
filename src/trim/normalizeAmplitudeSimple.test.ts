import {normalizeAmplitudeSimple} from './normalizeAmplitudeSimple'

describe('node > trim', function () {
	this.timeout(30000)

	it('normalizeWithWindow silence 0', function () {
		normalizeAmplitudeSimple({
			samplesData,
			channelsCount,
			channels,
			coef,
			separateChannels,
		})
	})
})
