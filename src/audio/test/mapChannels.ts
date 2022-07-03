export function mapChannels<T>(
  channelsCount: number,
  channels: number[],
  callback: (channel: number, active: boolean) => T,
): T[] {
  const result: T[] = []
  for (let channel = 0; channel < channelsCount; channel++) {
    const active = channels.includes(channel)
    result[channel] = callback(channel, active)
  }
  return result
}
