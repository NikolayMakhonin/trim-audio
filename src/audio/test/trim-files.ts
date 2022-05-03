import fse from 'fs-extra'
import {globby} from 'globby'
import path from 'path'
import {getAssetData} from './loadAsset'
import {AudioSamples} from '../contracts'
import {ffmpegDecode, ffmpegEncode, ffmpegEncodeMp3Params} from '@flemist/ffmpeg-encode-decode'
import {normalizeOffsetWithWindow} from '../normalizeOffsetWithWindow'
import {normalizeAmplitudeSimple} from '../normalizeAmplitudeSimple'
import {trimAudio} from '../trimAudio'
import {decibelToDispersion} from '../helpers'
import {normalizeAmplitudeWithWindow} from '../normalizeAmplitudeWithWindow'

const SILENCE_LEVEL_START_DEFAULT = -1.1 // use -1.5 for 'ф..'
const SILENCE_LEVEL_END_DEFAULT = -2

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
  silenceLevelStart,
  silenceLevelEnd,
}: {
  inputFilePath: string,
  outputFilePath: string,
  silenceLevelStart?: number,
  silenceLevelEnd?: number,
}) {
  if (silenceLevelStart == null) {
    silenceLevelStart = SILENCE_LEVEL_START_DEFAULT
  }
  if (silenceLevelEnd == null) {
    silenceLevelEnd = SILENCE_LEVEL_END_DEFAULT
  }

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
      windowSamples       : Math.round(samples.sampleRate / 50), // 50 Hz
      maxSilenceSamples   : Math.round(samples.sampleRate * 0.25), // 250 ms
      minContentSamples   : Math.round(samples.sampleRate * 0.09), // 90 ms
      minContentDispersion: decibelToDispersion(silenceLevelStart),
    },
    end: {
      windowSamples       : Math.round(samples.sampleRate / 50), // 50 Hz
      maxSilenceSamples   : Math.round(samples.sampleRate * 0.25), // 250 ms
      minContentSamples   : Math.round(samples.sampleRate * 0.09), // 90 ms
      minContentDispersion: decibelToDispersion(silenceLevelEnd),
    },
  })
  
  normalizeAmplitudeWithWindow({
    samplesData     : samples.data,
    channelsCount   : samples.channels,
    coef            : 0.9,
    windowSamples   : Math.round(samples.sampleRate / 15), // 15 Hz
    separateChannels: true,
  })

  await saveToMp3File(outputFilePath, samples)
}

export async function trimAudioFiles({
  inputFilesGlobs,
  getOutputFilePath,
  silenceLevelStart,
  silenceLevelEnd,
}: {
  inputFilesGlobs: string[],
  getOutputFilePath: (inputFilePath: string) => string,
  silenceLevelStart?: number,
  silenceLevelEnd?: number,
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
        silenceLevelStart,
        silenceLevelEnd,
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
  silenceLevelStart,
  silenceLevelEnd,
}: {
  inputDir: string,
  inputFilesRelativeGlobs: string[],
  outputDir: string,
  silenceLevelStart?: number,
  silenceLevelEnd?: number,
}) {
  return trimAudioFiles({
    inputFilesGlobs: inputFilesRelativeGlobs.map(o => path.resolve(inputDir, o)),
    getOutputFilePath(filePath) {
      return path.resolve(outputDir, path.relative(inputDir, filePath))
        .replace(/\.\w+$/, '') + '.mp3'
    },
    silenceLevelStart,
    silenceLevelEnd,
  })
}
