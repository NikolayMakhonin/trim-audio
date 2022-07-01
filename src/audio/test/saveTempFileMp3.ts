import {AudioSamples, ffmpegEncode, ffmpegEncodeMp3Params, FFmpegTransform} from '@flemist/ffmpeg-encode-decode'
import {saveTempFile} from './saveTempFile'

export async function saveTempFileMp3(
  ffmpegTransform: FFmpegTransform,
  fileName: string,
  samples: AudioSamples,
) {
  const data: Uint8Array = await ffmpegEncode(
    ffmpegTransform,
    samples,
    {
      outputFormat: 'mp3', // same as file extension
      // docs: http://ffmpeg.org/ffmpeg-codecs.html#libmp3lame
      params      : ffmpegEncodeMp3Params({
        bitrate    : 320,
        mode       : 'cbr',
        vbrQuality : 0,
        jointStereo: true,
      }),
    })

  await saveTempFile(fileName, data)
}

export async function saveTempFileWav(
  ffmpegTransform: FFmpegTransform,
  fileName: string,
  samples: AudioSamples,
) {
  const data: Uint8Array = await ffmpegEncode(
    ffmpegTransform,
    samples,
    {
      outputFormat: 'wav', // same as file extension
    })

  await saveTempFile(fileName, data)
}
