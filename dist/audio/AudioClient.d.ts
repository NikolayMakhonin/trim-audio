import { IWorkerEventBus, WorkerData, WorkerClient, IWorkerClient } from '@flemist/worker-server';
import { NormalizeAmplitudeSimpleArgs } from "./normalizeAmplitudeSimple";
import { SearchContentArgs, SearchContentResult, TrimAudioArgs, TrimAudioResult } from "./trimAudio";
import { SmoothAudioArgs } from "./smoothAudio";
import { NormalizeOffsetWithWindowArgs } from "./normalizeOffsetWithWindow";
import { NormalizeOffsetSimpleArgs } from "./normalizeOffsetSimple";
import { NormalizeAmplitudeWithWindowArgs } from "./normalizeAmplitudeWithWindow";
export declare type TAudioClientOptions = {};
export interface IAudioClient extends IWorkerClient {
    normalizeAmplitudeSimple(args: NormalizeAmplitudeSimpleArgs): Promise<WorkerData<Float32Array>>;
    normalizeAmplitudeWithWindow(args: NormalizeAmplitudeWithWindowArgs): Promise<WorkerData<Float32Array>>;
    normalizeOffsetSimple(args: NormalizeOffsetSimpleArgs): Promise<WorkerData<Float32Array>>;
    normalizeOffsetWithWindow(args: NormalizeOffsetWithWindowArgs): Promise<WorkerData<Float32Array>>;
    smoothAudio(args: SmoothAudioArgs): Promise<WorkerData<Float32Array>>;
    searchContent(args: SearchContentArgs): Promise<WorkerData<SearchContentResult>>;
    trimAudio(args: TrimAudioArgs): Promise<WorkerData<TrimAudioResult>>;
}
export declare class AudioClient extends WorkerClient<TAudioClientOptions> implements IAudioClient {
    private _normalizeAmplitudeSimple;
    private _normalizeAmplitudeWithWindow;
    private _normalizeOffsetSimple;
    private _normalizeOffsetWithWindow;
    private _smoothAudio;
    private _searchContent;
    private _trimAudio;
    constructor({ preInit, options, }: {
        preInit: boolean;
        options?: TAudioClientOptions;
    });
    protected _init(workerEventBus: IWorkerEventBus): Promise<void> | void;
    normalizeAmplitudeSimple(args: NormalizeAmplitudeSimpleArgs): Promise<WorkerData<Float32Array>>;
    normalizeAmplitudeWithWindow(args: NormalizeAmplitudeWithWindowArgs): Promise<WorkerData<Float32Array>>;
    normalizeOffsetSimple(args: NormalizeOffsetSimpleArgs): Promise<WorkerData<Float32Array>>;
    normalizeOffsetWithWindow(args: NormalizeOffsetWithWindowArgs): Promise<WorkerData<Float32Array>>;
    smoothAudio(args: SmoothAudioArgs): Promise<WorkerData<Float32Array>>;
    searchContent(args: SearchContentArgs): Promise<WorkerData<SearchContentResult>>;
    trimAudio(args: TrimAudioArgs): Promise<WorkerData<TrimAudioResult>>;
    protected _terminate(): Promise<void> | void;
}
