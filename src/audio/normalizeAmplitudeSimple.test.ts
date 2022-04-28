import {normalizeAmplitudeSimple} from './normalizeAmplitudeSimple'
import {createSamples, generateSilence} from './test/generateSamples'

describe('node > normalizeAmplitudeSimple', function () {
	this.timeout(30000)

	it('normalizeWithWindow silence 0', function () {
		const samples = createSamples({
			count     : 10000,
			sampleRate: 44100,
			channels  : 3,
		})
		
		generateSilence({
			samplesData  : samples.data,
			channelsCount: samples.channels,
			channel      : 0,
			start        : 100,
			endExclusive : 200,
			amplitude    : 0,
		})
		
		normalizeAmplitudeSimple({
			samplesData     : samples.data,
			channelsCount   : samples.channels,
			channels        : [0, 2],
			coef            : 0.5,
			separateChannels: false,
		})
	})
})
