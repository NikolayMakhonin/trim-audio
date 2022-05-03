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

const SILENCE_DECIBEL_START_DEFAULT = -22 // use -30 for 'ф..'
const SILENCE_DECIBEL_END_DEFAULT = -40

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
  silenceDecibelStart,
  silenceDecibelEnd,
}: {
  inputFilePath: string,
  outputFilePath: string,
  silenceDecibelStart?: number,
  silenceDecibelEnd?: number,
}) {
  if (silenceDecibelStart == null) {
    silenceDecibelStart = SILENCE_DECIBEL_START_DEFAULT
  }
  if (silenceDecibelEnd == null) {
    silenceDecibelEnd = SILENCE_DECIBEL_END_DEFAULT
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
      minContentDispersion: decibelToDispersion(silenceDecibelStart),
      space               : Math.round(samples.sampleRate / 15), // 15 Hz
    },
    end: {
      windowSamples       : Math.round(samples.sampleRate / 50), // 50 Hz
      maxSilenceSamples   : Math.round(samples.sampleRate * 0.25), // 250 ms
      minContentSamples   : Math.round(samples.sampleRate * 0.09), // 90 ms
      minContentDispersion: decibelToDispersion(silenceDecibelEnd),
      space               : Math.round(samples.sampleRate / 15), // 15 Hz
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
  silenceDecibelStart,
  silenceDecibelEnd,
}: {
  inputFilesGlobs: string[],
  getOutputFilePath: (inputFilePath: string) => string,
  silenceDecibelStart?: number,
  silenceDecibelEnd?: number,
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
        silenceDecibelStart,
        silenceDecibelEnd,
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
  silenceDecibelStart,
  silenceDecibelEnd,
}: {
  inputDir: string,
  inputFilesRelativeGlobs: string[],
  outputDir: string,
  silenceDecibelStart?: number,
  silenceDecibelEnd?: number,
}) {
  return trimAudioFiles({
    inputFilesGlobs: inputFilesRelativeGlobs.map(o => path.resolve(inputDir, o)),
    getOutputFilePath(filePath) {
      return path.resolve(outputDir, path.relative(inputDir, filePath))
        .replace(/\.\w+$/, '') + '.mp3'
    },
    silenceDecibelStart,
    silenceDecibelEnd,
  })
}
