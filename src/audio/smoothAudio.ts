import {generateIndexArray} from './helpers'
import {WorkerData, WorkerFunctionServerResultSync} from '@flemist/worker-server'
import {IAbortSignalFast} from '@flemist/abort-controller-fast'

function _smoothAudio({
  samplesData,
  channelsCount,
  channel,
  startSamples,
  endSamples,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channel: number,
  startSamples: number,
  endSamples: number,
}) {
  if (!startSamples && !endSamples) {
    return
  }
  if (!startSamples) {
    startSamples = 0
  }
  if (!endSamples) {
    endSamples = 0
  }

  const samplesCount = Math.floor(samplesData.length / channelsCount)
  if (startSamples + endSamples > samplesCount) {
    const mult = samplesCount / (startSamples + endSamples)
    startSamples *= mult
    endSamples *= mult
  }

  if (startSamples) {
    for (let i = 0; i < startSamples; i++) {
      const mult = i / startSamples
      samplesData[i * channelsCount + channel] *= mult
    }
  }
  if (endSamples) {
    for (let i = 0; i < endSamples; i++) {
      const mult = i / endSamples
      samplesData[(samplesCount - 1 - i) * channelsCount + channel] *= mult
    }
  }
}

export type SmoothAudioArgs = {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
  startSamples: number,
  endSamples: number,
}

export function smoothAudio(
  args: SmoothAudioArgs,
) {
  let {
    samplesData,
    channelsCount,
    channels,
    startSamples,
    endSamples,
  } = args

  if (channels == null) {
    channels = generateIndexArray(channelsCount)
  }

  const channelsLength = channels.length
  if (channelsLength !== 0) {
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
      _smoothAudio({
        samplesData,
        channelsCount,
        channel: channels[nChannel],
        startSamples,
        endSamples,
      })
    }
  }
}

const _smoothAudioWorker = smoothAudio
export const smoothAudioWorker = function smoothAudio(
  data: WorkerData<SmoothAudioArgs>,
  abortSignal?: IAbortSignalFast,
): WorkerFunctionServerResultSync<Float32Array> {
  _smoothAudioWorker(data.data)
  return {
    data        : data.data.samplesData,
    transferList: [data.data.samplesData.buffer],
  }
}
