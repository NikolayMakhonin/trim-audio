import {correctSample, EPSILON, generateIndexArray} from './helpers'
import type {WorkerData, WorkerFunctionServerResultSync} from '@flemist/worker-server'
import type {IAbortSignalFast} from '@flemist/abort-controller-fast'
import {Priority} from '@flemist/priority-queue'

function getMaxAmplitude({
  samplesData,
  channelsCount,
  channels,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
}) {
  if (channels == null) {
    channels = generateIndexArray(channelsCount)
  }

  const channelsLength = channels.length
  if (channelsLength === 0) {
    return 0
  }

  const samplesCount = Math.floor(samplesData.length / channelsCount)

  let max = 0
  for (let i = 0; i < samplesCount; i++) {
    const index = i * channelsCount
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
      const channel = channels[nChannel]
      const value = samplesData[index + channel]
      const valueAbs = Math.abs(value)
      if (valueAbs > max) {
        max = valueAbs
      }
    }
  }

  return max
}

function multAmplitude({
  samplesData,
  channelsCount,
  channels,
  mult,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
  mult: number,
}) {
  if (channels == null) {
    channels = generateIndexArray(channelsCount)
  }

  const channelsLength = channels.length
  if (channelsLength === 0) {
    return
  }

  const samplesCount = Math.floor(samplesData.length / channelsCount)
  for (let i = 0; i < samplesCount; i++) {
    const index = i * channelsCount
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
      const channel = channels[nChannel]
      const value = samplesData[index + channel]
      samplesData[index + channel] = correctSample(value * mult)
    }
  }
}

function _normalizeAmplitudeSimple({
  samplesData,
  channelsCount,
  channels,
  coef,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
  coef: number,
}) {
  const max = getMaxAmplitude({
    samplesData,
    channelsCount,
    channels,
  })
  if (max > EPSILON) {
    multAmplitude({
      samplesData,
      channelsCount,
      channels,
      mult: coef / max,
    })
  }
}

export type NormalizeAmplitudeSimpleArgs = {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
  separateChannels?: boolean,
  coef: number,
  priority?: Priority,
  abortSignal?: IAbortSignalFast,
}

export function normalizeAmplitudeSimple(
  args: NormalizeAmplitudeSimpleArgs,
) {
  let {
    samplesData,
    channelsCount,
    channels,
    separateChannels,
    coef,
  } = args

  if (channels == null) {
    channels = generateIndexArray(channelsCount)
  }

  const channelsLength = channels.length
  if (channelsLength !== 0) {
    if (separateChannels) {
      for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
        _normalizeAmplitudeSimple({
          samplesData,
          channelsCount,
          channels: [channels[nChannel]],
          coef,
        })
      }
    }
    else {
      _normalizeAmplitudeSimple({
        samplesData,
        channelsCount,
        channels,
        coef,
      })
    }
  }
}

const _normalizeAmplitudeSimpleWorker = normalizeAmplitudeSimple
export const normalizeAmplitudeSimpleWorker = function normalizeAmplitudeSimple(
  data: WorkerData<NormalizeAmplitudeSimpleArgs>,
  abortSignal?: IAbortSignalFast,
): WorkerFunctionServerResultSync<Float32Array> {
  _normalizeAmplitudeSimpleWorker(data.data)
  return {
    data        : data.data.samplesData,
    transferList: [data.data.samplesData.buffer],
  }
}
