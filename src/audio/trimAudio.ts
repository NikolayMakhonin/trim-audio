import {EPSILON, generateIndexArray} from './helpers'
import {WorkerData, WorkerFunctionServerResultSync} from '@flemist/worker-server'
import {IAbortSignalFast} from '@flemist/abort-controller-fast'

// max dispersion of normalized audio = 1
// max decibel of normalized audio = 0
export type SearchContentArgs = {
  samplesData: Float32Array,
  channelsCount: number,
  samplesCount: number,
  channels?: number[],
  windowSamples: number,
  backward: boolean,
  minContentSamples: number,
  minContentDispersion: number,
  maxSilenceSamples: number,
  start?: number,
  endExclusive?: number,
}

export type SearchContentResult = {
  samplesData: Float32Array,
  index: number,
}

export function searchContent(
  data: WorkerData<SearchContentArgs>,
  abortSignal?: IAbortSignalFast,
): WorkerFunctionServerResultSync<SearchContentResult> {
  let {
    samplesData,
    channelsCount,
    samplesCount,
    channels,
    windowSamples,
    backward,
    minContentSamples,
    minContentDispersion,
    maxSilenceSamples,
    start,
    endExclusive,
  } = data.data

  if (windowSamples < 2) {
    throw new Error('windowSamples should be >= 2')
  }
  if (windowSamples > samplesCount) {
    windowSamples = samplesCount
  }

  if (channels == null) {
    channels = generateIndexArray(channelsCount)
  }

  function result(index: number): WorkerFunctionServerResultSync<SearchContentResult> {
    return {
      data: {
        samplesData,
        index,
      },
      transferList: [samplesData.buffer],
    }
  }

  const channelsLength = channels.length
  if (channelsLength === 0) {
    return result(0)
  }

  if (start == null) {
    start = 0
  }
  if (endExclusive == null) {
    endExclusive = samplesCount
  }

  let contentStartIndex = 0
  let contentStartEnd = 0

  let sum = 0
  let sumSqr = 0
  let totalSilenceLength = 0

  for (let i = 0; i < endExclusive; i++) {
    for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
      const channel = channels[nChannel]
      const index = (backward ? samplesCount - 1 - i : i) * channelsCount + channel
      const value = samplesData[index]
      sum += value
      sumSqr += value * value
    }

    if (i >= windowSamples) {
      for (let nChannel = 0; nChannel < channelsLength; nChannel++) {
        const channel = channels[nChannel]
        const prevIndex = (
          backward
            ? samplesCount - 1 - (i - windowSamples)
            : (i - windowSamples)
        ) * channelsCount + channel
        const prevValue = samplesData[prevIndex]
        sum -= prevValue
        sumSqr -= prevValue * prevValue
      }
    }

    if (i >= windowSamples - 1) {
      const count = windowSamples * channelsLength
      const avg = sum / count
      const sqrAvg = sumSqr / count
      const dispersion = (sqrAvg - avg * avg) // * count / (count - 1)

      if (i + 1 - contentStartEnd > maxSilenceSamples + windowSamples) {
        contentStartEnd = 0
      }

      if (dispersion >= minContentDispersion - EPSILON) {
        if (contentStartEnd === 0) {
          contentStartIndex = i + 1 - windowSamples
          totalSilenceLength = 0
        }
        contentStartEnd = i + 1
        if (contentStartEnd - contentStartIndex - totalSilenceLength >= minContentSamples) {
          return result(contentStartIndex)
        }
      }
      else if (i + 2 - contentStartIndex > windowSamples * 2) {
        totalSilenceLength++
      }
    }
  }

  if (contentStartEnd === 0 || contentStartEnd - contentStartIndex < minContentSamples) {
    return result(endExclusive)
  }

  return result(contentStartIndex)
}

export type TrimAudioArgs = {
  samplesData: Float32Array,
  channelsCount: number,
  channels?: number[],
  start?: {
    windowSamples: number,
    minContentSamples: number,
    minContentDispersion: number,
    maxSilenceSamples: number,
    space: number,
  },
  end?: {
    windowSamples: number,
    minContentSamples: number,
    minContentDispersion: number,
    maxSilenceSamples: number,
    space: number,
  },
}

export function trimAudio(
  data: WorkerData<TrimAudioArgs>,
  abortSignal?: IAbortSignalFast,
): WorkerFunctionServerResultSync<Float32Array> {
  let {
    samplesData,
    channelsCount,
    channels,
    start,
    end,
  } = data.data

  const samplesCount = Math.floor(samplesData.length / channelsCount)

  let trimStart: number
  if (!start) {
    trimStart = 0
  }
  else {
    const result = searchContent({
      data: {
        samplesData,
        channelsCount,
        samplesCount,
        channels,
        windowSamples       : start.windowSamples,
        backward            : false,
        minContentSamples   : start.minContentSamples,
        minContentDispersion: start.minContentDispersion,
        maxSilenceSamples   : start.maxSilenceSamples,
      },
      transferList: [samplesData.buffer],
    })

    samplesData = result.data.samplesData
    trimStart = result.data.index
  }

  let trimEndExclusive: number
  if (!end) {
    trimEndExclusive = samplesCount
  }
  else {
    const result = searchContent({
      data: {
        samplesData,
        channelsCount,
        samplesCount,
        channels,
        windowSamples       : end.windowSamples,
        backward            : true,
        minContentSamples   : end.minContentSamples,
        minContentDispersion: end.minContentDispersion,
        maxSilenceSamples   : end.maxSilenceSamples,
        endExclusive        : start
          && Math.min(samplesCount, samplesCount - trimStart),
      },
      transferList: [samplesData.buffer],
    })

    samplesData = result.data.samplesData
    trimEndExclusive = samplesCount - 1 - result.data.index + 1
  }

  if (trimStart >= trimEndExclusive) {
    return {
      data: new Float32Array(0),
    }
  }

  if (start?.space) {
    trimStart = Math.max(0, trimStart - start.space)
  }
  if (end?.space) {
    trimEndExclusive = Math.min(samplesCount, trimEndExclusive + end.space)
  }

  const newSamplesData = new Float32Array(
    samplesData.buffer,
    trimStart * channelsCount * 4,
    (trimEndExclusive - trimStart) * channelsCount,
  )

  return {
    data        : newSamplesData,
    transferList: [newSamplesData.buffer],
  }
}
