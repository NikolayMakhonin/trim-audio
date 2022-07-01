import {getAssetData} from './loadAsset'
import {AudioSamples} from '../contracts'
import {ffmpegDecode, FFmpegTransform} from '@flemist/ffmpeg-encode-decode'

export async function loadAssetAudio(
  ffmpegTransform: FFmpegTransform,
  assetFileName: string,
) {
  const data = await getAssetData(assetFileName)

  const samples: AudioSamples = await ffmpegDecode(
    ffmpegTransform,
    data,
    {
      channels  : 2,
      sampleRate: 44100,
    })

  return samples
}
