import {getAssetData} from './loadAsset'
import {AudioSamples} from '../contracts'
import {ffmpegDecode} from '@flemist/ffmpeg-encode-decode'

export async function loadAssetAudio(assetFileName: string) {
  const data = await getAssetData(assetFileName)

  const samples: AudioSamples = await ffmpegDecode(data, {
    channels  : 2,
    sampleRate: 44100,
  })

  return samples
}
