import {loadAssetAudio} from './test/loadAssetAudio'
import {normalizeWithWindow} from './trim'
import {saveTempFileMp3} from './test/saveTempFileMp3'

describe('node > trim', function () {
	this.timeout(30000)

	it('normalizeWithWindow', async function () {
		const samples = await loadAssetAudio('word.mp3')
		normalizeWithWindow({
			samples,
			coef                   : 0.95,
			maxNoiseRelativeSamples: 0.05,
			windowSamples          : samples.sampleRate * 0.5,
		})
		await saveTempFileMp3('word.mp3', samples)
	})
})
