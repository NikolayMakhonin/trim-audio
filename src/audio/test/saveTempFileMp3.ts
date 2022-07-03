import {AudioSamples, ffmpegEncode, ffmpegEncodeMp3Params, FFmpegTransform} from '@flemist/ffmpeg-encode-decode'
import {saveTempFile} from './saveTempFile'
import {Priority} from '@flemist/priority-queue'
import {IAbortSignalFast} from '@flemist/abort-controller-fast'

export async function saveTempFileMp3({
  ffmpegTransform,
  fileName,
  samples,
  priority,
  abortSignal,
}: {
  ffmpegTransform: FFmpegTransform,
  fileName: string,
  samples: AudioSamples,
  priority?: Priority,
  abortSignal?: IAbortSignalFast,
}) {
  const data: Uint8Array = await ffmpegEncode({
    ffmpegTransform,
    samples,
    encode: {
      outputFormat: 'mp3', // same as file extension
      // docs: http://ffmpeg.org/ffmpeg-codecs.html#libmp3lame
      params      : ffmpegEncodeMp3Params({
        bitrate    : 320,
        mode       : 'cbr',
        vbrQuality : 0,
        jointStereo: true,
      }),
    },
    priority,
    abortSignal,
  })

  await saveTempFile(fileName, data)
}

export async function saveTempFileWav(
  ffmpegTransform: FFmpegTransform,
  fileName: string,
  samples: AudioSamples,
  priority?: Priority,
  abortSignal?: IAbortSignalFast,
) {
  const data: Uint8Array = await ffmpegEncode({
    ffmpegTransform,
    samples,
    encode: {
      outputFormat: 'wav', // same as file extension
    },
    priority,
    abortSignal,
  })

  await saveTempFile(fileName, data)
}
