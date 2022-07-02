import {WorkerClientPool} from '@flemist/worker-server'
import {IPool} from '@flemist/time-limits'
import {NormalizeAmplitudeSimpleArgs} from 'src/audio/normalizeAmplitudeSimple'
import {NormalizeAmplitudeWithWindowArgs} from 'src/audio/normalizeAmplitudeWithWindow'
import {NormalizeOffsetSimpleArgs} from 'src/audio/normalizeOffsetSimple'
import {NormalizeOffsetWithWindowArgs} from 'src/audio/normalizeOffsetWithWindow'
import {SmoothAudioArgs} from 'src/audio/smoothAudio'
import {SearchContentArgs, TrimAudioArgs} from 'src/audio/trimAudio'
import {AudioClient, IAudioClient, TAudioClientOptions} from 'src/audio/AudioClient'

export class AudioClientPool
  extends WorkerClientPool<AudioClient>
  implements IAudioClient {
  constructor({
    threadsPool,
    preInit,
    options,
  }: {
    threadsPool: IPool
    preInit?: boolean
    options?: TAudioClientOptions
  }) {
    super({
      threadsPool,
      createClient() {
        return new AudioClient({
          preInit,
          options,
        })
      },
      preInit,
    })
  }

  async normalizeAmplitudeSimple(args: NormalizeAmplitudeSimpleArgs) {
    return this.use(1, ([client]) => {
      return client.normalizeAmplitudeSimple(args)
    })
  }

  async normalizeAmplitudeWithWindow(args: NormalizeAmplitudeWithWindowArgs) {
    return this.use(1, ([client]) => {
      return client.normalizeAmplitudeWithWindow(args)
    })
  }

  async normalizeOffsetSimple(args: NormalizeOffsetSimpleArgs) {
    return this.use(1, ([client]) => {
      return client.normalizeOffsetSimple(args)
    })
  }

  async normalizeOffsetWithWindow(args: NormalizeOffsetWithWindowArgs) {
    return this.use(1, ([client]) => {
      return client.normalizeOffsetWithWindow(args)
    })
  }

  async smoothAudio(args: SmoothAudioArgs) {
    return this.use(1, ([client]) => {
      return client.smoothAudio(args)
    })
  }

  async searchContent(args: SearchContentArgs) {
    return this.use(1, ([client]) => {
      return client.searchContent(args)
    })
  }

  async trimAudio(args: TrimAudioArgs) {
    return this.use(1, ([client]) => {
      return client.trimAudio(args)
    })
  }
}
