import fse from 'fs-extra'
import globby from 'globby'
import path from 'path'
import {getAssetData} from './loadAsset'
import {AudioSamples} from '../contracts'
import {ffmpegDecode, ffmpegEncode, ffmpegEncodeMp3Params} from '@flemist/ffmpeg-encode-decode'
import {normalizeOffsetWithWindow} from '../normalizeOffsetWithWindow'
import {normalizeAmplitudeSimple} from '../normalizeAmplitudeSimple'
import {trimAudio} from '../trimAudio'
import {decibelToDispersion} from '../helpers'
import {normalizeAmplitudeWithWindow} from '../normalizeAmplitudeWithWindow'

// const SILENCE_DECIBEL_START_DEFAULT = -22.5 // use -30.5 for 'ф..'
// const SILENCE_DECIBEL_END_DEFAULT = -40.5

const START_WINDOW_DEFAULT = 50
const START_DECIBEL_DEFAULT = -31
const START_SPACE_DEFAULT = 10
const START_MAX_SILENCE_DEFAULT = 400
const START_MIN_CONTENT_DEFAULT = 500

const END_WINDOW_DEFAULT = 50
const END_DECIBEL_DEFAULT = -31
const END_SPACE_DEFAULT = 100
const END_MAX_SILENCE_DEFAULT = 400
const END_MIN_CONTENT_DEFAULT = 500

async function readAudioFile(filePath: string): Promise<AudioSamples> {
  const data = await getAssetData(filePath)

  const samples: AudioSamples = await ffmpegDecode(data, {
    channels  : 2,
    sampleRate: 44100,
  })

  return samples
}

async function saveToMp3File(filePath, samples: AudioSamples) {
  const data: Uint8Array = await ffmpegEncode(samples, {
    outputFormat: 'mp3', // same as file extension
    // docs: http://ffmpeg.org/ffmpeg-codecs.html#libmp3lame
    params      : ffmpegEncodeMp3Params({
      bitrate    : 320,
      mode       : 'cbr',
      vbrQuality : 0,
      jointStereo: true,
    }),
  })

  await fse.writeFile(filePath, data)
}

export async function trimAudioFile({
  inputFilePath,
  outputFilePath,
}: {
  inputFilePath: string,
  outputFilePath: string,
}) {
  inputFilePath = path.resolve(inputFilePath)
  outputFilePath = path.resolve(outputFilePath)

  const samples = await readAudioFile(inputFilePath)

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

  normalizeAmplitudeSimple({
    samplesData     : samples.data,
    channelsCount   : samples.channels,
    coef            : 1,
    separateChannels: true,
  })

  samples.data = trimAudio({
    samplesData  : samples.data,
    channelsCount: samples.channels,
    start        : {
      windowSamples       : Math.round(samples.sampleRate * START_WINDOW_DEFAULT / 1000),
      maxSilenceSamples   : Math.round(samples.sampleRate * START_MAX_SILENCE_DEFAULT / 1000),
      minContentSamples   : Math.round(samples.sampleRate * START_MIN_CONTENT_DEFAULT / 1000),
      minContentDispersion: decibelToDispersion(START_DECIBEL_DEFAULT),
      space               : Math.round(samples.sampleRate * START_SPACE_DEFAULT / 1000),
    },
    end: {
      windowSamples       : Math.round(samples.sampleRate * END_WINDOW_DEFAULT / 1000),
      maxSilenceSamples   : Math.round(samples.sampleRate * END_MAX_SILENCE_DEFAULT / 1000),
      minContentSamples   : Math.round(samples.sampleRate * END_MIN_CONTENT_DEFAULT / 1000),
      minContentDispersion: decibelToDispersion(END_DECIBEL_DEFAULT),
      space               : Math.round(samples.sampleRate * END_SPACE_DEFAULT / 1000),
    },
  })
  
  normalizeAmplitudeWithWindow({
    samplesData     : samples.data,
    channelsCount   : samples.channels,
    coef            : 0.9,
    windowSamples   : Math.round(samples.sampleRate * 0.5),
    separateChannels: true,
  })

  await saveToMp3File(outputFilePath, samples)
}

export async function trimAudioFiles({
  inputFilesGlobs,
  getOutputFilePath,
}: {
  inputFilesGlobs: string[],
  getOutputFilePath: (inputFilePath: string) => string,
}) {
  const inputFilesPaths = await globby(inputFilesGlobs.map(o => o.replace(/\\/g, '/')))

  await Promise.all(inputFilesPaths.map(async (inputFilePath) => {
    const outputFilePath = getOutputFilePath(inputFilePath)

    if (fse.existsSync(outputFilePath)) {
      return
    }

    try {
      await trimAudioFile({
        inputFilePath,
        outputFilePath,
      })
      console.log('OK: ' + outputFilePath)
    } catch (err) {
      console.log('ERROR: ' + inputFilePath + '\r\n' + (err.stack || err.message || err))
    }
  }))

  console.log('Completed!')
}

export function trimAudioFilesFromDir({
  inputDir,
  inputFilesRelativeGlobs,
  outputDir,
}: {
  inputDir: string,
  inputFilesRelativeGlobs: string[],
  outputDir: string,
}) {
  return trimAudioFiles({
    inputFilesGlobs: inputFilesRelativeGlobs.map(o => path.resolve(inputDir, o)),
    getOutputFilePath(filePath) {
      return path.resolve(outputDir, path.relative(inputDir, filePath))
        .replace(/\.\w+$/, '') + '.mp3'
    },
  })
}
