import {correctSample, EPSILON, generateIndexArray} from './helpers'

function getOffset({
  samplesData,
  channelsCount,
  channel,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channel: number,
}) {
  const samplesCount = Math.floor(samplesData.length / channelsCount)

  let sum = 0
  for (let i = 0; i < samplesCount; i++) {
    const index = i * channelsCount
    const value = samplesData[index + channel]
    sum += value
  }

  return sum / samplesCount
}

function addOffset({
  samplesData,
  channelsCount,
  channel,
  offset,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channel: number,
  offset: number,
}) {
  const samplesCount = Math.floor(samplesData.length / channelsCount)
  for (let i = 0; i < samplesCount; i++) {
    const index = i * channelsCount
    const value = samplesData[index + channel]
    samplesData[index + channel] = correctSample(value + offset)
  }
}

function _normalizeOffsetSimple({
  samplesData,
  channelsCount,
  channel,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channel: number,
}) {
  const offset = getOffset({
    samplesData,
    channelsCount,
    channel,
  })
  addOffset({
    samplesData,
    channelsCount,
    channel,
    offset: -offset,
  })
}

export function normalizeOffsetSimple({
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
    return
  }

  for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
    _normalizeOffsetSimple({
      samplesData,
      channelsCount,
      channel: channels[nChannel],
    })
  }
}
