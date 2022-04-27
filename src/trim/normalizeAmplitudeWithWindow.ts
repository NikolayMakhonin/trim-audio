import {correctSample, EPSILON, generateIndexArray} from './helpers'

function _normalizeAmplitudeWithWindow({
  samplesData,
  channelsCount,
  channels,
  coef,
  windowSamples,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
  coef: number,
  windowSamples: number,
}) {
  const windowSamplesHalf = Math.ceil(windowSamples / 2)
  const windowSamples2 = windowSamples * 2

  if (channels == null) {
    channels = generateIndexArray(channelsCount)
  }

  const channelsLength = channels.length
  if (channelsLength === 0) {
    return
  }

  const samplesCount = Math.floor(samplesData.length / channelsCount)
  let maxPrev = 0
  let max = 0
  let maxNext = 0

  function _normalize(i: number) {
    let maxJ = Math.min(windowSamplesHalf, samplesCount - i + windowSamples2)
    for (let j = 0; j < maxJ; j++) {
      const _max = maxPrev > max ? maxPrev + (max - maxPrev) * j / windowSamplesHalf : max
      const mult = _max < EPSILON ? 1 : coef / _max
      const index = (i - windowSamples2 + j) * channelsCount
      for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
        const channel = channels[nChannel]
        const value = samplesData[index + channel]
        samplesData[index + channel] = (value * mult)
      }
    }
    const _windowSamplesHalf = windowSamples - windowSamplesHalf
    maxJ = Math.min(_windowSamplesHalf, samplesCount - i + windowSamples2 - windowSamplesHalf)
    for (let j = 0; j < maxJ; j++) {
      const _max = maxNext > max ? max + (maxNext - max) * j / _windowSamplesHalf : max
      const mult = _max < EPSILON ? 1 : coef / _max
      const index = (i - windowSamples2 + j + windowSamplesHalf) * channelsCount
      for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
        const channel = channels[nChannel]
        const value = samplesData[index + channel]
        samplesData[index + channel] = correctSample(value * mult)
      }
    }
  }

  for (let i = 0; i < samplesCount; i++) {
    if (i >= windowSamples2 && i % windowSamples === 0) {
      _normalize(i)
    }
    if (i % windowSamples === 0) {
      maxPrev = max
      max = maxNext
      maxNext = 0
    }
    const index = i * channelsCount
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
      const channel = channels[nChannel]
      const valueNext = samplesData[index + channel]
      const valueNextAbs = Math.abs(valueNext)
      if (valueNextAbs > maxNext) {
        maxNext = valueNextAbs
      }
    }
  }

  const i = Math.ceil(samplesCount / windowSamples) * windowSamples
  _normalize(i)
  maxPrev = max
  max = maxNext
  maxNext = 0
  _normalize(i + windowSamples)
}

export function normalizeAmplitudeWithWindow({
  samplesData,
  channelsCount,
  channels,
  separateChannels,
  coef,
  windowSamples,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
  separateChannels?: boolean,
  coef: number,
  windowSamples: number,
}) {
  if (channels == null) {
    channels = generateIndexArray(channelsCount)
  }

  const channelsLength = channels.length
  if (channelsLength === 0) {
    return
  }

  if (separateChannels) {
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
      _normalizeAmplitudeWithWindow({
        samplesData,
        channelsCount,
        channels: [channels[nChannel]],
        coef,
        windowSamples,
      })
    }
    return
  }

  _normalizeAmplitudeWithWindow({
    samplesData,
    channelsCount,
    channels,
    coef,
    windowSamples,
  })
}
