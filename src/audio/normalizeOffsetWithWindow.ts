import {checkIsNumber, generateIndexArray} from './helpers'
import {WorkerData, WorkerFunctionServerResultSync} from '@flemist/worker-server'
import {IAbortSignalFast} from '@flemist/abort-controller-fast'
import {normalizeOffsetSimple} from "~/src";
import {NormalizeOffsetSimpleArgs} from "src/audio/normalizeOffsetSimple";

function _normalizeOffsetWithWindow({
  samplesData,
  channelsCount,
  channel,
  windowSamples,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channel: number,
  windowSamples: number,
}) {
  const samplesCount = Math.floor(samplesData.length / channelsCount)
  if (windowSamples < 1) {
    throw new Error('windowSamples should be >= 1')
  }
  const samplesCountHalf = Math.floor(samplesCount / 2)
  if (windowSamples > samplesCountHalf) {
    windowSamples = samplesCountHalf
  }

  const windowSamplesHalf = Math.ceil(windowSamples / 2)
  const windowSamples2 = windowSamples * 2

  let offsetPrev = 0
  let offset = 0
  let offsetNext = 0
  let sumNext = 0

  function _normalize(i: number) {
    const _windowSamplesHalf = windowSamples - windowSamplesHalf
    let offsetJ = Math.min(windowSamplesHalf, samplesCount - i + windowSamples2)
    for (let j = 0; j < offsetJ; j++) {
      const index = (i - windowSamples2 + j) * channelsCount
      const _offset = offsetPrev + (offset - offsetPrev) * (j + _windowSamplesHalf) / windowSamples
      const value = samplesData[index + channel]
      samplesData[index + channel] = checkIsNumber(value + _offset)
    }
    offsetJ = Math.min(_windowSamplesHalf, samplesCount - i + windowSamples2 - windowSamplesHalf)
    for (let j = 0; j < offsetJ; j++) {
      const index = (i - windowSamples2 + j + windowSamplesHalf) * channelsCount
      const _offset = offset + (offsetNext - offset) * j / windowSamples
      const value = samplesData[index + channel]
      samplesData[index + channel] = checkIsNumber(value + _offset)
    }
  }

  for (let i = 0; i < samplesCount; i++) {
    if (i % windowSamples === 0) {
      offsetNext = -sumNext / windowSamples
    }
    if (i >= windowSamples2 && i % windowSamples === 0) {
      _normalize(i)
    }
    if (i % windowSamples === 0) {
      offsetPrev = i === windowSamples ? offsetNext : offset
      offset = offsetNext
      sumNext = 0
    }
    const index = i * channelsCount
    const valueNext = samplesData[index + channel]
    sumNext += valueNext
  }

  offsetNext = -sumNext / (samplesCount % windowSamples || windowSamples)
  const i = Math.ceil(samplesCount / windowSamples) * windowSamples
  _normalize(i)
  offsetPrev = i === windowSamples ? offsetNext : offset
  offset = offsetNext
  _normalize(i + windowSamples)
}

export type NormalizeOffsetWithWindowArgs = {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
  windowSamples: number,
}

export function normalizeOffsetWithWindow(
  args: NormalizeOffsetWithWindowArgs,
) {
  let {
    samplesData,
    channelsCount,
    channels,
    windowSamples,
  } = args

  if (channels == null) {
    channels = generateIndexArray(channelsCount)
  }

  const channelsLength = channels.length
  if (channelsLength !== 0) {
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
      _normalizeOffsetWithWindow({
        samplesData,
        channelsCount,
        channel: channels[nChannel],
        windowSamples,
      })
    }
  }
}

const _normalizeOffsetWithWindowWorker = normalizeOffsetWithWindow
export const normalizeOffsetWithWindowWorker = function normalizeOffsetWithWindow(
  data: WorkerData<NormalizeOffsetWithWindowArgs>,
  abortSignal?: IAbortSignalFast,
): WorkerFunctionServerResultSync<Float32Array> {
  _normalizeOffsetWithWindowWorker(data.data)
  return {
    data        : data.data.samplesData,
    transferList: [data.data.samplesData.buffer],
  }
}
