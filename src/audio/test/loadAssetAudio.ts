import {getAssetData} from './loadAsset'
import {AudioSamples} from '../contracts'
import {ffmpegDecode, FFmpegTransform} from '@flemist/ffmpeg-encode-decode'
import {Priority} from '@flemist/priority-queue'
import {IAbortSignalFast} from '@flemist/abort-controller-fast'

export async function loadAssetAudio({
  ffmpegTransform,
  assetFileName,
  priority,
  abortSignal,
}: {
  ffmpegTransform: FFmpegTransform,
  assetFileName: string,
  priority?: Priority,
  abortSignal?: IAbortSignalFast,
}) {
  const data = await getAssetData(assetFileName)

  const samples: AudioSamples = await ffmpegDecode({
    ffmpegTransform,
    inputData: data,
    decode   : {
      channels  : 2,
      sampleRate: 44100,
    },
    priority,
    abortSignal,
  })

  return samples
}
