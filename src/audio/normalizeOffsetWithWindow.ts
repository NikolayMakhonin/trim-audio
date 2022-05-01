import {checkIsNumber, correctSample, EPSILON, generateIndexArray} from './helpers'

function _normalizeOffsetWithWindow({
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
  let offsetPrev = 0
  let offset = 0
  let offsetNext = 0
  let sumNext = 0

  function _normalize(i: number) {
    let offsetJ = Math.min(windowSamplesHalf, samplesCount - i + windowSamples2)
    for (let j = 0; j < offsetJ; j++) {
      const index = (i - windowSamples2 + j) * channelsCount
      const _offset = offsetPrev + (offset - offsetPrev) * (j + windowSamplesHalf) / windowSamples
      for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
        const channel = channels[nChannel]
        const value = samplesData[index + channel]
        samplesData[index + channel] = checkIsNumber(value + _offset)
      }
    }
    const _windowSamplesHalf = windowSamples - windowSamplesHalf
    offsetJ = Math.min(_windowSamplesHalf, samplesCount - i + windowSamples2 - windowSamplesHalf)
    for (let j = 0; j < offsetJ; j++) {
      const index = (i - windowSamples2 + j + windowSamplesHalf) * channelsCount
      const _offset = offset + (offsetNext - offset) * j / windowSamples
      for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
        const channel = channels[nChannel]
        const value = samplesData[index + channel]
        samplesData[index + channel] = checkIsNumber(value + _offset)
      }
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
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
      const channel = channels[nChannel]
      const valueNext = samplesData[index + channel]
      sumNext += valueNext
    }
  }

  offsetNext = -sumNext / (samplesCount % windowSamples || windowSamples)
  const i = Math.ceil(samplesCount / windowSamples) * windowSamples
  _normalize(i)
  offsetPrev = i === windowSamples ? offsetNext : offset
  offset = offsetNext
  sumNext = 0
  _normalize(i + windowSamples)
}

export function normalizeOffsetWithWindow({
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
      _normalizeOffsetWithWindow({
        samplesData,
        channelsCount,
        channels: [channels[nChannel]],
        coef,
        windowSamples,
      })
    }
    return
  }

  _normalizeOffsetWithWindow({
    samplesData,
    channelsCount,
    channels,
    coef,
    windowSamples,
  })
}
