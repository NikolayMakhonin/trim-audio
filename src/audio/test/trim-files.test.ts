/* eslint-disable no-shadow */
import {trimAudioFile, trimAudioFilesFromDir} from './trim-files'
import {getAssetPath} from './loadAsset'

xdescribe('audio > test > trim-files', function () {
	this.timeout(60000000)

	it('file', async function () {
		await trimAudioFile({
			inputFilePath : getAssetPath('word.mp3'),
			outputFilePath: 'trim/word.mp3',
		})
	})

	it('files', async function () {
		await trimAudioFilesFromDir({
			inputDir               : 'I:/Work/_GIT/GitLab/Develop/dot.Net/MyProjects/LearnWords/Old/LearnWordsSimple/bin/Debug/Cache/Speech/en',
			inputFilesRelativeGlobs: ['**/*.mp3'],
			outputDir              : 'E:/Temp/trim/speech',
		})
	})
})
