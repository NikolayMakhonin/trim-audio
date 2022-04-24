import {AudioSamples, ffmpegEncode, ffmpegEncodeMp3Params} from '@flemist/ffmpeg-encode-decode'
import {saveTempFile} from './saveTempFile'

export async function saveTempFileMp3(fileName: string, samples: AudioSamples) {
  const data: Uint8Array = await ffmpegEncode(samples, {
    outputFormat: 'mp3', // same as file extension
    // docs: http://ffmpeg.org/ffmpeg-codecs.html#libmp3lame
    params      : ffmpegEncodeMp3Params({
      mode       : 'vbr',
      vbrQuality : 0,
      jointStereo: true,
    }),
  })

  await saveTempFile(fileName, data)
}
