import fse from 'fs-extra'
import globby from 'globby'
import path from 'path'
import {getAssetData} from './loadAsset'
import {AudioSamples} from '../contracts'
import {ffmpegDecode, ffmpegEncode, ffmpegEncodeMp3Params, FFmpegTransform} from '@flemist/ffmpeg-encode-decode'
import {normalizeOffsetWithWindow} from '../normalizeOffsetWithWindow'
import {normalizeAmplitudeSimple} from '../normalizeAmplitudeSimple'
import {trimAudio} from '../trimAudio'
import {decibelToDispersion} from '../helpers'
import {smoothAudio} from '../smoothAudio'

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
  ffmpegTransform,
  {
    inputFilePath,
    outputFilePath,
  }: {
  inputFilePath: string,
  outputFilePath: string,
}) {
  inputFilePath = path.resolve(inputFilePath)
  outputFilePath = path.resolve(outputFilePath)

  const samples = await readAudioFile(ffmpegTransform, inputFilePath)

  const dir = path.dirname(outputFilePath)
  if (!fse.existsSync(dir)) {
    await fse.mkdirp(dir)
  }
  if (fse.existsSync(outputFilePath)) {
    await fse.unlink(outputFilePath)
  }

  normalizeOffsetWithWindow({
    samplesData  : samples.data,
    channelsCount: samples.channels,
    windowSamples: Math.round(samples.sampleRate / 30), // 15 Hz
  })

  const normalizeCoef = 0.95

  normalizeAmplitudeSimple({
    samplesData     : samples.data,
    channelsCount   : samples.channels,
    coef            : normalizeCoef,
    separateChannels: true,
  })

  trimAudio({
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

  // normalizeAmplitudeSimple({
  //   samplesData     : samples.data,
  //   channelsCount   : samples.channels,
  //   coef            : 0.9,
  //   separateChannels: true,
  // })

  // normalizeAmplitudeWithWindow({
  //   samplesData     : samples.data,
  //   channelsCount   : samples.channels,
  //   coef            : 0.9,
  //   maxMult         : 3,
  //   windowSamples   : Math.round(samples.sampleRate * 0.1),
  //   separateChannels: true,
  // })

  // const samples: AudioSamples = {
  //   data      : new Float32Array(44100),
  //   channels  : 2,
  //   sampleRate: 44100,
  // }

  smoothAudio({
    samplesData  : samples.data,
    channelsCount: samples.channels,
    startSamples : samples.sampleRate * 20 / 1000,
    endSamples   : samples.sampleRate * 50 / 1000,
  })

  await saveToMp3File(
    ffmpegTransform,
    outputFilePath,
    samples,
  )
}

export async function trimAudioFiles(
  ffmpegTransform: FFmpegTransform,
  {
    inputFilesGlobs,
    getOutputFilePath,
  }: {
  inputFilesGlobs: string[],
  getOutputFilePath: (inputFilePath: string) => string,
}) {
  const inputFilesPaths = await globby(inputFilesGlobs.map(o => o.replace(/\\/g, '/')))
  if (inputFilesPaths.length === 0) {
    throw new Error(`There is no files:\r\n${inputFilesGlobs.join('\r\n')}`)
  }
  inputFilesPaths.sort()

  // await Promise.all(inputFilesPaths.map(async (inputFilePath) => {
  for (const inputFilePath of inputFilesPaths) {
    const outputFilePath = getOutputFilePath(inputFilePath)

    if (fse.existsSync(outputFilePath)) {
      continue
    }

    try {
      await trimAudioFile(
        ffmpegTransform,
        {
          inputFilePath,
          outputFilePath,
        })
      console.log('OK: ' + outputFilePath)
    }
    catch (err) {
      console.log('ERROR: ' + inputFilePath + '\r\n' + (err.stack || err.message || err))
      throw err
    }
  }
  // }))

  console.log('Completed!')
}

export function trimAudioFilesFromDir(
  ffmpegTransform: FFmpegTransform,
  {
    inputDir,
    inputFilesRelativeGlobs,
    outputDir,
  }: {
  inputDir: string,
  inputFilesRelativeGlobs: string[],
  outputDir: string,
}) {
  return trimAudioFiles(
    ffmpegTransform,
    {
      inputFilesGlobs: inputFilesRelativeGlobs.map(o => path.resolve(inputDir, o)),
      getOutputFilePath(filePath) {
        return path.resolve(outputDir, path.relative(inputDir, filePath))
          .replace(/\.\w+$/, '') + '.mp3'
      },
    })
}
