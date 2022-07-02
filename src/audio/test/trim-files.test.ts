/* eslint-disable no-shadow */
import {trimAudioFile, trimAudioFilesFromDir} from './trim-files'
import {getAssetPath} from './loadAsset'
import {getTempFilePath} from './saveTempFile'
import {FFmpegTransformClientPool, getFFmpegTransform} from '@flemist/ffmpeg-encode-decode'
import {IPoolRunner, Pool, PoolRunner, Pools} from '@flemist/time-limits'
import {AudioClientPool} from 'src/audio/AudioClientPool'

const threadsPool = new Pool(7)

export const ffmpegTransformClient = new FFmpegTransformClientPool(
  {
    threadsPool: new Pools(threadsPool, new Pool(3)),
    preInit    : false,
    options    : {
      preload : false,
      loglevel: 'warning',
      // log     : false,
      // logger({data: {threadId, type, message}}) {
      // 	console.log(`[${threadId}] [${type}] ${message}`)
      // },
    },
  },
)

export const audioClient = new AudioClientPool(
  {
    threadsPool,
    preInit: false,
    options: {
      preload : false,
      loglevel: 'warning',
      // log     : false,
      // logger({data: {threadId, type, message}}) {
      // 	console.log(`[${threadId}] [${type}] ${message}`)
      // },
    },
  },
)

const ffmpegTransform = getFFmpegTransform(ffmpegTransformClient)

describe('audio > test > trim-files', function () {
  this.timeout(60000000)

  after(async () => {
    await Promise.all([
      ffmpegTransformClient.terminate(),
      audioClient.terminate(),
    ])
  })

  it('file', async function () {
    await trimAudioFile(
      ffmpegTransform,
      audioClient,
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

  it('files', async function () {
    await trimAudioFilesFromDir(
      ffmpegTransform,
      audioClient,
      new PoolRunner(new Pool(threadsPool.maxSize * 2)),
      {
        inputDir               : 'D:/RemoteData/Mega2/Backups/LearnWords/Cache/Speech',
        inputFilesRelativeGlobs: ['**/*.mp3'],
        outputDir              : 'E:/Temp/trim/speech',
      },
    )
  })
})
