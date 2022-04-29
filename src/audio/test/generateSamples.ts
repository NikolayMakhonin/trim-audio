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

export function generateFillSamples({
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

export type SamplesType = 'fill' | 'triangle'
export type SamplesPattern = [type: SamplesType, start: number, endExclusive: number, amplitude: number]

export function generateSamples({
  samplesData,
  channelsCount,
  patterns,
}: {
  samplesData: Float32Array,
  channelsCount: number,
  patterns: SamplesPattern[][],
}) {
  for (let channel = 0; channel < channelsCount; channel++) {
    const _patterns = patterns[channel]
    for (let i = 0, len = _patterns.length; i < len; i++) {
      const [type, start, endExclusive, amplitude] = _patterns[i]
      switch (type) {
        case 'fill':
          generateFillSamples({
            samplesData,
            channelsCount,
            channel,
            start,
            endExclusive,
            amplitude,
          })
          break
        case 'triangle':
          generateTriangleSamples({
            samplesData,
            channelsCount,
            channel,
            start,
            endExclusive,
            amplitude,
          })
          break
        default:
          throw new Error('Unknown type: ' + type)
      }
    }
  }
}
