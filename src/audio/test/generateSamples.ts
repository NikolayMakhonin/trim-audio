import {AudioSamples} from '@flemist/ffmpeg-encode-decode'

export function calcStats({
  samplesData,
  channelsCount,
  channel,
  start,
  endExclusive,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channel: number,
  start: number,
  endExclusive: number,
}): {
  count: number,
  sum: number,
  sumSqr: number,
} {
  let sum = 0
  let sumSqr = 0

  const len = endExclusive - start
  for (let i = 0; i < len; i++) {
    const value = samplesData[i * channelsCount + channel]
    sum += value
    sumSqr += value * value
  }

  return {
    count: len,
    sum,
    sumSqr,
  }
}

export function createSamples({
  count,
  channels,
  sampleRate,
}: {
  count: number,
  channels: number,
  sampleRate,
}) {
  const samples:AudioSamples = {
    data      : new Float32Array(count),
    channels  : 2,
    sampleRate: 44100,
  }

  return samples
}

export function generateSilence({
  samplesData,
  channelsCount,
  channel,
  start,
  endExclusive,
  amplitude,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channel: number,
  start: number,
  endExclusive: number,
  amplitude: number,
}) {
  const len = endExclusive - start
  for (let i = 0; i < len; i++) {
    samplesData[i * channelsCount + channel] += amplitude
  }
}

export function generateTriangleSamples({
  samplesData,
  channelsCount,
  channel,
  start,
  endExclusive,
  amplitude,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channel: number,
  start: number,
  endExclusive: number,
  amplitude: number,
}) {
  const len = endExclusive - start
  for (let i = 0; i < len; i++) {
    samplesData[i * channelsCount + channel] += amplitude * (1 - Math.abs(2 * i / len - 1))
  }
}

export function generateTrianglesSamples({
  samplesData,
  channelsCount,
  channel,
  patterns,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channel: number,
  patterns: [number, number, number][],
}) {
  for (let i = 0, len = patterns.length; i < len; i++) {
    const pattern = patterns[i]
    generateTriangleSamples({
      samplesData,
      channelsCount,
      channel,
      start       : pattern[0],
      endExclusive: pattern[1],
      amplitude   : pattern[2],
    })
  }
}
