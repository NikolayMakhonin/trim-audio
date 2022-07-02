import {
  IWorkerEventBus,
  WorkerData,
  workerFunctionClient,
  WorkerFunctionClient,
  WorkerClient,
  IWorkerClient,
} from '@flemist/worker-server'
import {NormalizeAmplitudeSimpleArgs} from 'src/audio/normalizeAmplitudeSimple'
import {SearchContentArgs, SearchContentResult, TrimAudioArgs} from 'src/audio/trimAudio'
import {SmoothAudioArgs} from 'src/audio/smoothAudio'
import {NormalizeOffsetWithWindowArgs} from 'src/audio/normalizeOffsetWithWindow'
import {NormalizeOffsetSimpleArgs} from 'src/audio/normalizeOffsetSimple'
import {NormalizeAmplitudeWithWindowArgs} from 'src/audio/normalizeAmplitudeWithWindow'
import {audioWorkerPath} from './paths.cjs'

export type TAudioClientOptions = {}

export interface IAudioClient extends IWorkerClient {
  normalizeAmplitudeSimple(args: NormalizeAmplitudeSimpleArgs): Promise<WorkerData<Float32Array>>;
  normalizeAmplitudeWithWindow(args: NormalizeAmplitudeWithWindowArgs): Promise<WorkerData<Float32Array>>;
  normalizeOffsetSimple(args: NormalizeOffsetSimpleArgs): Promise<WorkerData<Float32Array>>;
  normalizeOffsetWithWindow(args: NormalizeOffsetWithWindowArgs): Promise<WorkerData<Float32Array>>;
  smoothAudio(args: SmoothAudioArgs): Promise<WorkerData<Float32Array>>;
  searchContent(args: SearchContentArgs): Promise<WorkerData<SearchContentResult>>;
  trimAudio(args: TrimAudioArgs): Promise<WorkerData<Float32Array>>;
}

export class AudioClient extends WorkerClient<TAudioClientOptions> implements IAudioClient {
  private _normalizeAmplitudeSimple: WorkerFunctionClient<NormalizeAmplitudeSimpleArgs, Float32Array, void>
  private _normalizeAmplitudeWithWindow: WorkerFunctionClient<NormalizeAmplitudeWithWindowArgs, Float32Array, void>
  private _normalizeOffsetSimple: WorkerFunctionClient<NormalizeOffsetSimpleArgs, Float32Array, void>
  private _normalizeOffsetWithWindow: WorkerFunctionClient<NormalizeOffsetWithWindowArgs, Float32Array, void>
  private _smoothAudio: WorkerFunctionClient<SmoothAudioArgs, Float32Array, void>
  private _searchContent: WorkerFunctionClient<SearchContentArgs, SearchContentResult, void>
  private _trimAudio: WorkerFunctionClient<TrimAudioArgs, Float32Array, void>

  constructor({
    preInit,
    options,
  }: {
    preInit: boolean,
    options?: TAudioClientOptions,
  }) {
    super({
      workerFilePath: audioWorkerPath,
      options       : options || {},
      preInit,
    })
  }

  protected _init(workerEventBus: IWorkerEventBus): Promise<void> | void {
    this._normalizeAmplitudeSimple = workerFunctionClient({
      eventBus: workerEventBus,
      name    : 'normalizeAmplitudeSimple',
    })
    this._normalizeAmplitudeWithWindow = workerFunctionClient({
      eventBus: workerEventBus,
      name    : 'normalizeAmplitudeWithWindow',
    })
    this._normalizeOffsetSimple = workerFunctionClient({
      eventBus: workerEventBus,
      name    : 'normalizeOffsetSimple',
    })
    this._normalizeOffsetWithWindow = workerFunctionClient({
      eventBus: workerEventBus,
      name    : 'normalizeOffsetWithWindow',
    })
    this._smoothAudio = workerFunctionClient({
      eventBus: workerEventBus,
      name    : 'smoothAudio',
    })
    this._searchContent = workerFunctionClient({
      eventBus: workerEventBus,
      name    : 'searchContent',
    })
    this._trimAudio = workerFunctionClient({
      eventBus: workerEventBus,
      name    : 'trimAudio',
    })
  }

  async normalizeAmplitudeSimple(args: NormalizeAmplitudeSimpleArgs): Promise<WorkerData<Float32Array>> {
    await this.init()
    const result = await this._normalizeAmplitudeSimple({
      data        : args,
      transferList: [args.samplesData.buffer],
    })
    return result
  }

  async normalizeAmplitudeWithWindow(args: NormalizeAmplitudeWithWindowArgs): Promise<WorkerData<Float32Array>> {
    await this.init()
    const result = await this._normalizeAmplitudeWithWindow({
      data        : args,
      transferList: [args.samplesData.buffer],
    })
    return result
  }

  async normalizeOffsetSimple(args: NormalizeOffsetSimpleArgs): Promise<WorkerData<Float32Array>> {
    await this.init()
    const result = await this._normalizeOffsetSimple({
      data        : args,
      transferList: [args.samplesData.buffer],
    })
    return result
  }

  async normalizeOffsetWithWindow(args: NormalizeOffsetWithWindowArgs): Promise<WorkerData<Float32Array>> {
    await this.init()
    const result = await this._normalizeOffsetWithWindow({
      data        : args,
      transferList: [args.samplesData.buffer],
    })
    return result
  }

  async smoothAudio(args: SmoothAudioArgs): Promise<WorkerData<Float32Array>> {
    await this.init()
    const result = await this._smoothAudio({
      data        : args,
      transferList: [args.samplesData.buffer],
    })
    return result
  }

  async searchContent(args: SearchContentArgs): Promise<WorkerData<SearchContentResult>> {
    await this.init()
    const result = await this._searchContent({
      data        : args,
      transferList: [args.samplesData.buffer],
    })
    return result
  }

  async trimAudio(args: TrimAudioArgs): Promise<WorkerData<Float32Array>> {
    await this.init()
    const result = await this._trimAudio({
      data        : args,
      transferList: [args.samplesData.buffer],
    })
    return result
  }

  protected _terminate(): Promise<void> | void {
    this._normalizeAmplitudeSimple = null
    this._normalizeAmplitudeWithWindow = null
    this._normalizeOffsetSimple = null
    this._normalizeOffsetWithWindow = null
    this._smoothAudio = null
    this._searchContent = null
    this._trimAudio = null
  }
}
