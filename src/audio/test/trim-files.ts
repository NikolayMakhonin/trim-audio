import fse from 'fs-extra'
import globby from 'globby'
import path from 'path'
import {getAssetData} from './loadAsset'
import {AudioSamples} from '../contracts'
import {
  ffmpegDecode,
  ffmpegEncode,
  ffmpegEncodeMp3Params,
  FFmpegTransform,
} from '@flemist/ffmpeg-encode-decode'
// import {normalizeOffsetWithWindow} from '../normalizeOffsetWithWindow'
// import {normalizeAmplitudeSimple} from '../normalizeAmplitudeSimple'
// import {trimAudio} from '../trimAudio'
import {decibelToDispersion} from '../helpers'
import {IAudioClient} from 'src/audio/AudioClient'
import {IPoolRunner} from '@flemist/time-limits'
import {normalizeAmplitudeSimple, normalizeOffsetWithWindow, smoothAudio, trimAudio} from '~/src'
import {Priority, priorityCreate} from '@flemist/priority-queue'
import {IAbortSignalFast} from '@flemist/abort-controller-fast'
// import {smoothAudio} from '../smoothAudio'

// const SILENCE_DECIBEL_START_DEFAULT = -22.5 // use -30.5 for 'ф..'
// const SILENCE_DECIBEL_END_DEFAULT = -40.5

const START_WINDOW_DEFAULT = 50
const START_DECIBEL_DEFAULT = -31
const START_SPACE_DEFAULT = 20
const START_MAX_SILENCE_DEFAULT = 350
const START_MIN_CONTENT_DEFAULT = 200

const END_WINDOW_DEFAULT = 50
const END_DECIBEL_DEFAULT = -31
const END_SPACE_DEFAULT = 100
const END_MAX_SILENCE_DEFAULT = 350
const END_MIN_CONTENT_DEFAULT = 200

async function readAudioFile({
  ffmpegTransform,
  filePath,
  priority,
  abortSignal,
}: {
  ffmpegTransform: FFmpegTransform,
  filePath: string,
  priority?: Priority,
  abortSignal?: IAbortSignalFast,
}): Promise<AudioSamples> {
  const data = await getAssetData(filePath)

  const samples = await ffmpegDecode({
    ffmpegTransform,
    inputData: data,
    decode   : {
      channels  : 1,
      sampleRate: 44100,
    },
    priority,
    abortSignal,
  })

  return samples
}

async function saveToMp3File({
  ffmpegTransform,
  filePath,
  samples,
  priority,
  abortSignal,
}: {
  ffmpegTransform: FFmpegTransform,
  filePath,
  samples: AudioSamples,
  priority?: Priority,
  abortSignal?: IAbortSignalFast,
}) {
  // if (samples.data.length < 256) {
  //   throw new Error('samples.data.length === ' + samples.data.length)
  // }
  const data = await ffmpegEncode({
    ffmpegTransform,
    samples,
    encode: {
      outputFormat: 'mp3', // same as file extension
      // docs: http://ffmpeg.org/ffmpeg-codecs.html#libmp3lame
      params      : ffmpegEncodeMp3Params({
        mode       : 'vbr',
        vbrQuality : 8,
        jointStereo: true,
      }),
    },
    priority,
    abortSignal,
  })

  await fse.writeFile(filePath, data)
}

export async function trimAudioFile({
  useWorker,
  ffmpegTransform,
  audioClient,
  inputFilePath,
  outputFilePath,
  priority,
  abortSignal,
}: {
  useWorker: boolean,
  ffmpegTransform: FFmpegTransform,
  audioClient: IAudioClient,
  inputFilePath: string,
  outputFilePath: string,
  priority?: Priority,
  abortSignal?: IAbortSignalFast,
}) {
  inputFilePath = path.resolve(inputFilePath)
  outputFilePath = path.resolve(outputFilePath)

  const filePriority = priorityCreate(1, priority)
  const transformPriority = priorityCreate(2, priority)

  const samples = await readAudioFile({
    ffmpegTransform,
    filePath: inputFilePath,
    priority: priorityCreate(-1, filePriority),
    abortSignal,
  })

  // const samples: AudioSamples = {
  //   data      : new Float32Array(16000),
  //   channels  : 1,
  //   sampleRate: 16000,
  // }

  const dir = path.dirname(outputFilePath)
  if (!fse.existsSync(dir)) {
    await fse.mkdirp(dir)
  }
  if (fse.existsSync(outputFilePath)) {
    await fse.unlink(outputFilePath)
  }

  if (useWorker) {
    samples.data = (await audioClient.normalizeOffsetWithWindow({
      samplesData  : samples.data,
      channelsCount: samples.channels,
      windowSamples: Math.round(samples.sampleRate / 30), // 15 Hz
      priority     : priorityCreate(-1, transformPriority),
      abortSignal,
    })).data
  }
  else {
    normalizeOffsetWithWindow({
      samplesData  : samples.data,
      channelsCount: samples.channels,
      windowSamples: Math.round(samples.sampleRate / 30), // 15 Hz
    })
  }

  const normalizeCoef = 0.95

  if (useWorker) {
    samples.data = (await audioClient.normalizeAmplitudeSimple({
      samplesData     : samples.data,
      channelsCount   : samples.channels,
      coef            : normalizeCoef,
      separateChannels: true,
      priority        : priorityCreate(-2, transformPriority),
      abortSignal,
    })).data
  }
  else {
    normalizeAmplitudeSimple({
      samplesData     : samples.data,
      channelsCount   : samples.channels,
      coef            : normalizeCoef,
      separateChannels: true,
    })
  }

  if (useWorker) {
    samples.data = (await audioClient.trimAudio({
      samplesData  : samples.data,
      channelsCount: samples.channels,
      start        : {
        windowSamples       : Math.round(samples.sampleRate * START_WINDOW_DEFAULT / 1000),
        maxSilenceSamples   : Math.round(samples.sampleRate * START_MAX_SILENCE_DEFAULT / 1000),
        minContentSamples   : Math.round(samples.sampleRate * START_MIN_CONTENT_DEFAULT / 1000),
        minContentDispersion: normalizeCoef * normalizeCoef * decibelToDispersion(START_DECIBEL_DEFAULT),
        space               : Math.round(samples.sampleRate * START_SPACE_DEFAULT / 1000),
      },
      end: {
        windowSamples       : Math.round(samples.sampleRate * END_WINDOW_DEFAULT / 1000),
        maxSilenceSamples   : Math.round(samples.sampleRate * END_MAX_SILENCE_DEFAULT / 1000),
        minContentSamples   : Math.round(samples.sampleRate * END_MIN_CONTENT_DEFAULT / 1000),
        minContentDispersion: normalizeCoef * normalizeCoef * decibelToDispersion(END_DECIBEL_DEFAULT),
        space               : Math.round(samples.sampleRate * END_SPACE_DEFAULT / 1000),
      },
      priority: priorityCreate(-3, transformPriority),
      abortSignal,
    })).data.result
  }
  else {
    samples.data = trimAudio({
      samplesData  : samples.data,
      channelsCount: samples.channels,
      start        : {
        windowSamples       : Math.round(samples.sampleRate * START_WINDOW_DEFAULT / 1000),
        maxSilenceSamples   : Math.round(samples.sampleRate * START_MAX_SILENCE_DEFAULT / 1000),
        minContentSamples   : Math.round(samples.sampleRate * START_MIN_CONTENT_DEFAULT / 1000),
        minContentDispersion: normalizeCoef * normalizeCoef * decibelToDispersion(START_DECIBEL_DEFAULT),
        space               : Math.round(samples.sampleRate * START_SPACE_DEFAULT / 1000),
      },
      end: {
        windowSamples       : Math.round(samples.sampleRate * END_WINDOW_DEFAULT / 1000),
        maxSilenceSamples   : Math.round(samples.sampleRate * END_MAX_SILENCE_DEFAULT / 1000),
        minContentSamples   : Math.round(samples.sampleRate * END_MIN_CONTENT_DEFAULT / 1000),
        minContentDispersion: normalizeCoef * normalizeCoef * decibelToDispersion(END_DECIBEL_DEFAULT),
        space               : Math.round(samples.sampleRate * END_SPACE_DEFAULT / 1000),
      },
    })
  }

  // samples.data = (await audioClient.normalizeAmplitudeSimple({
  //   samplesData     : samples.data,
  //   channelsCount   : samples.channels,
  //   coef            : 0.9,
  //   separateChannels: true,
  // })).data

  // samples.data = (await audioClient.normalizeAmplitudeWithWindow({
  //   samplesData     : samples.data,
  //   channelsCount   : samples.channels,
  //   coef            : 0.9,
  //   maxMult         : 3,
  //   windowSamples   : Math.round(samples.sampleRate * 0.1),
  //   separateChannels: true,
  // })).data

  if (useWorker) {
    samples.data = (await audioClient.smoothAudio({
      samplesData  : samples.data,
      channelsCount: samples.channels,
      startSamples : samples.sampleRate * 20 / 1000,
      endSamples   : samples.sampleRate * 50 / 1000,
      priority     : priorityCreate(-4, transformPriority),
      abortSignal,
    })).data
  }
  else {
    smoothAudio({
      samplesData  : samples.data,
      channelsCount: samples.channels,
      startSamples : samples.sampleRate * 20 / 1000,
      endSamples   : samples.sampleRate * 50 / 1000,
    })
  }

  await saveToMp3File({
    ffmpegTransform,
    filePath: outputFilePath,
    samples,
    priority: priorityCreate(-2, filePriority),
    abortSignal,
  })
}

export async function trimAudioFiles({
  useWorker,
  ffmpegTransform,
  audioClient,
  runner,
  inputFilesGlobs,
  getOutputFilePath,
  priority,
  abortSignal,
}: {
  useWorker: boolean,
  ffmpegTransform: FFmpegTransform,
  audioClient: IAudioClient,
  runner: IPoolRunner,
  inputFilesGlobs: string[],
  getOutputFilePath: (inputFilePath: string) => string,
  priority?: Priority,
  abortSignal?: IAbortSignalFast,
}) {
  const inputFilesPaths = await globby(inputFilesGlobs.map(o => o.replace(/\\/g, '/')))
  if (inputFilesPaths.length === 0) {
    throw new Error(`There is no files:\r\n${inputFilesGlobs.join('\r\n')}`)
  }
  inputFilesPaths.sort()

  await Promise.all(inputFilesPaths.map((inputFilePath, i) => runner.run(1, async () => {
    // for (const inputFilePath of inputFilesPaths) {
    const outputFilePath = getOutputFilePath(inputFilePath)

    if (fse.existsSync(outputFilePath)) {
      return
      // continue
    }

    try {
      await trimAudioFile({
        useWorker,
        ffmpegTransform,
        audioClient,
        inputFilePath,
        outputFilePath,
        priority: priorityCreate(i, priority),
        abortSignal,
      })
      // console.log('OK: ' + outputFilePath)
    }
    catch (err) {
      console.log('ERROR: ' + inputFilePath + '\r\n' + (err.stack || err.message || err))
      throw err
    }
  // }
  })))

  console.log('Completed!')
}

export function trimAudioFilesFromDir({
  useWorker,
  ffmpegTransform,
  audioClient,
  runner,
  inputDir,
  inputFilesRelativeGlobs,
  outputDir,
  priority,
  abortSignal,
}: {
  useWorker: boolean,
  ffmpegTransform: FFmpegTransform,
  audioClient: IAudioClient,
  runner: IPoolRunner,
  inputDir: string,
  inputFilesRelativeGlobs: string[],
  outputDir: string,
  priority?: Priority,
  abortSignal?: IAbortSignalFast,
}) {
  return trimAudioFiles({
    useWorker,
    ffmpegTransform,
    audioClient,
    runner,
    inputFilesGlobs: inputFilesRelativeGlobs.map(o => path.resolve(inputDir, o)),
    getOutputFilePath(filePath) {
      return path.resolve(outputDir, path.relative(inputDir, filePath))
        .replace(/\.\w+$/, '') + '.mp3'
    },
    priority,
    abortSignal,
  })
}
