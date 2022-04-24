import {loadAssetAudio} from './test/loadAssetAudio'
import {normalizeWithWindow} from './trim'
import {saveTempFileMp3} from './test/saveTempFileMp3'
import {AudioSamples} from '@flemist/ffmpeg-encode-decode'

describe('node > trim', function () {
	this.timeout(30000)

	function testSilence(volume: number, normalize: (samples: AudioSamples) => void) {
		const samples:AudioSamples = {
			data      : new Float32Array(44100 * 2 * 5),
			channels  : 2,
			sampleRate: 44100,
		}

		for (let i = 0; i < samples.data.length; i++) {
			samples.data[i] = volume
		}

		normalize(samples)

		for (let i = 0; i < samples.data.length; i++) {
			assert.strictEqual(samples.data[i], volume)
		}
	}

	it('normalizeWithWindow silence 0', function () {
		testSilence(0, samples => normalizeWithWindow({
			samples,
			coef                   : 0.95,
			maxNoiseRelativeSamples: 0.05,
			windowSamples          : 2, // samples.sampleRate * 0.5,
		}))
	})

	it('normalizeWithWindow silence 1', function () {
		testSilence(0, samples => normalizeWithWindow({
			samples,
			coef                   : 0.95,
			maxNoiseRelativeSamples: 0.05,
			windowSamples          : 2, // samples.sampleRate * 0.5,
		}))
	})

	it('normalizeWithWindow silence -1', function () {
		testSilence(0, samples => normalizeWithWindow({
			samples,
			coef                   : 0.95,
			maxNoiseRelativeSamples: 0.0001,
			windowSamples          : 2, // samples.sampleRate * 0.5,
		}))
	})

	it('normalizeWithWindow simple', async function () {
		const samples: AudioSamples = {
			data      : new Float32Array(44100 * 5),
			channels  : 2,
			sampleRate: 44100,
		}

		// const len = 50
		// for (let i = 0; i < len; i++) {
		// 	const value = 1 - 1 * Math.abs(i - len / 2) / len * 2
		// 	samples.data[i * 2 + 0] = value
		// 	samples.data[i * 2 + 1] = value
		// }
		// for (let i = len; i < len * 2; i++) {
		// 	const value = -1 + 1 * Math.abs(i % len - len / 2) / len * 2
		// 	samples.data[i * 2 + 0] = value
		// 	samples.data[i * 2 + 1] = value
		// }
		samples.data[0] = 1
		samples.data[1] = 1
		samples.data[2] = -1
		samples.data[3] = -1

		normalizeWithWindow({
			samples,
			coef                   : 1,
			maxNoiseRelativeSamples: 200 / (samples.sampleRate * 0.5),
			windowSamples          : samples.sampleRate * 0.5,
		})
		
		await saveTempFileMp3('simple.mp3', samples)
	})
	
	it('normalizeWithWindow', async function () {
		const samples = await loadAssetAudio('word.mp3')
		normalizeWithWindow({
			samples,
			coef                   : 1,
			maxNoiseRelativeSamples: 50 / (samples.sampleRate * 0.5),
			windowSamples          : samples.sampleRate * 0.5,
		})
		await saveTempFileMp3('word.mp3', samples)
	})
})
