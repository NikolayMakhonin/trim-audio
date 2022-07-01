/* eslint-disable no-shadow */
import {trimAudioFile, trimAudioFilesFromDir} from './trim-files'
import {getAssetPath} from './loadAsset'
import {getTempFilePath} from './saveTempFile'
import {FFmpegTransformClientMT, getFFmpegTransform} from '@flemist/ffmpeg-encode-decode'

export const ffmpegTransformClient = new FFmpegTransformClientMT(
  {
    threads : 3,
    preload : false,
    loglevel: 'warning',
    // log     : false,
    // logger({data: {threadId, type, message}}) {
    // 	console.log(`[${threadId}] [${type}] ${message}`)
    // },
  },
)

const ffmpegTransform = getFFmpegTransform(ffmpegTransformClient)

describe('audio > test > trim-files', function () {
  this.timeout(60000000)

  after(async () => {
    await ffmpegTransformClient.terminate()
  })

  it('file', async function () {
    await trimAudioFile(
      ffmpegTransform,
      {
        inputFilePath : getAssetPath('vi_ten.mp3'),
        outputFilePath: getTempFilePath('vi_ten.mp3'),
      },
    )
    console.log('SUCCESS')
    // await trimAudioFile({
    // 	inputFilePath : getAssetPath('word.mp3'),
    // 	outputFilePath: getTempFilePath('word.mp3'),
    // })
    // await trimAudioFile({
    // 	inputFilePath : getAssetPath('фиксируем.ogg'),
    // 	outputFilePath: getTempFilePath('фиксируем.mp3'),
    // })
    // await trimAudioFile({
    // 	inputFilePath : getAssetPath('преданность_самоотдача.ogg'),
    // 	outputFilePath: getTempFilePath('преданность_самоотдача.mp3'),
    // })
  })

  xit('files', async function () {
    await trimAudioFilesFromDir(
      ffmpegTransform,
      {
        inputDir               : 'I:/Work/_GIT/GitLab/Develop/dot.Net/MyProjects/LearnWords/Old/LearnWordsSimple/bin/Debug/Cache/Speech',
        inputFilesRelativeGlobs: ['**/*.mp3'],
        outputDir              : 'E:/Temp/trim/speech',
      },
    )
  })
})
