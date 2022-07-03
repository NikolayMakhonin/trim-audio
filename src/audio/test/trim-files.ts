import fse from 'fs-extra'
import globby from 'globby'
import path from 'path'
import {getAssetData} from './loadAsset'
import {AudioSamples} from '../contracts'
import {ffmpegDecode, ffmpegEncode, ffmpegEncodeMp3Params, FFmpegTransform} from '@flemist/ffmpeg-encode-decode'
// import {normalizeOffsetWithWindow} from '../normalizeOffsetWithWindow'
// import {normalizeAmplitudeSimple} from '../normalizeAmplitudeSimple'
// import {trimAudio} from '../trimAudio'
import {decibelToDispersion} from '../helpers'
import {IAudioClient} from 'src/audio/AudioClient'
import {IPoolRunner} from '@flemist/time-limits'
import {normalizeAmplitudeSimple, normalizeOffsetWithWindow, smoothAudio, trimAudio} from '~/src'
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

async function readAudioFile(
  ffmpegTransform: FFmpegTransform,
  filePath: string,
): Promise<AudioSamples> {
  const data = await getAssetData(filePath)

  const samples: AudioSamples = await ffmpegDecode(
    ffmpegTransform,
    data, {
      channels  : 1,
      sampleRate: 44100,
    })

  return samples
}

async function saveToMp3File(
  ffmpegTransform: FFmpegTransform,
  filePath,
  samples: AudioSamples,
) {
  // if (samples.data.length < 256) {
  //   throw new Error('samples.data.length === ' + samples.data.length)
  // }
  const data: Uint8Array = await ffmpegEncode(
    ffmpegTransform,
    samples,
    {
      outputFormat: 'mp3', // same as file extension
      // docs: http://ffmpeg.org/ffmpeg-codecs.html#libmp3lame
      params      : ffmpegEncodeMp3Params({
        mode       : 'vbr',
        vbrQuality : 8,
        jointStereo: true,
      }),
    })

  await fse.writeFile(filePath, data)
}

export async function trimAudioFile(
  useWorker: boolean,
  ffmpegTransform,
  audioClient: IAudioClient,
  {
    inputFilePath,
    outputFilePath,
  }: {
    inputFilePath: string,
    outputFilePath: string,
  },
) {
  inputFilePath = path.resolve(inputFilePath)
  outputFilePath = path.resolve(outputFilePath)

  const samples = await readAudioFile(ffmpegTransform, inputFilePath)

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

  await saveToMp3File(
    ffmpegTransform,
    outputFilePath,
    samples,
  )
}

export async function trimAudioFiles(
  useWorker: boolean,
  ffmpegTransform: FFmpegTransform,
  audioClient: IAudioClient,
  runner: IPoolRunner,
  {
    inputFilesGlobs,
    getOutputFilePath,
  }: {
    inputFilesGlobs: string[],
    getOutputFilePath: (inputFilePath: string) => string,
  },
) {
  const inputFilesPaths = await globby(inputFilesGlobs.map(o => o.replace(/\\/g, '/')))
  if (inputFilesPaths.length === 0) {
    throw new Error(`There is no files:\r\n${inputFilesGlobs.join('\r\n')}`)
  }
  inputFilesPaths.sort()

  await Promise.all(inputFilesPaths.map((inputFilePath) => runner.run(1, async () => {
  // for (const inputFilePath of inputFilesPaths) {
    const outputFilePath = getOutputFilePath(inputFilePath)

    if (fse.existsSync(outputFilePath)) {
      return
      // continue
    }

    try {
      await trimAudioFile(
        useWorker,
        ffmpegTransform,
        audioClient,
        {
          inputFilePath,
          outputFilePath,
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

export function trimAudioFilesFromDir(
  useWorker: boolean,
  ffmpegTransform: FFmpegTransform,
  audioClient: IAudioClient,
  runner: IPoolRunner,
  {
    inputDir,
    inputFilesRelativeGlobs,
    outputDir,
  }: {
    inputDir: string,
    inputFilesRelativeGlobs: string[],
    outputDir: string,
  },
) {
  return trimAudioFiles(
    useWorker,
    ffmpegTransform,
    audioClient,
    runner,
    {
      inputFilesGlobs: inputFilesRelativeGlobs.map(o => path.resolve(inputDir, o)),
      getOutputFilePath(filePath) {
        return path.resolve(outputDir, path.relative(inputDir, filePath))
          .replace(/\.\w+$/, '') + '.mp3'
      },
    })
}
