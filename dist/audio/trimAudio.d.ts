import { WorkerData, WorkerFunctionServerResultSync } from '@flemist/worker-server';
import { IAbortSignalFast } from '@flemist/abort-controller-fast';
import { Priority } from '@flemist/priority-queue';
export declare type SearchContentArgs = {
    samplesData: Float32Array;
    channelsCount: number;
    samplesCount: number;
    channels?: number[];
    windowSamples: number;
    backward: boolean;
    minContentSamples: number;
    minContentDispersion: number;
    maxSilenceSamples: number;
    start?: number;
    endExclusive?: number;
    priority?: Priority;
    abortSignal?: IAbortSignalFast;
};
export declare function searchContent(args: SearchContentArgs): number;
export declare type SearchContentResult = {
    samplesData: Float32Array;
    result: number;
};
export declare const searchContentWorker: (data: WorkerData<SearchContentArgs>, abortSignal?: IAbortSignalFast) => WorkerFunctionServerResultSync<SearchContentResult>;
export declare type TrimAudioArgs = {
    samplesData: Float32Array;
    channelsCount: number;
    channels?: number[];
    start?: {
        windowSamples: number;
        minContentSamples: number;
        minContentDispersion: number;
        maxSilenceSamples: number;
        space: number;
    };
    end?: {
        windowSamples: number;
        minContentSamples: number;
        minContentDispersion: number;
        maxSilenceSamples: number;
        space: number;
    };
    priority?: Priority;
    abortSignal?: IAbortSignalFast;
};
export declare function trimAudio(args: TrimAudioArgs): Float32Array;
export declare type TrimAudioResult = {
    samplesData: Float32Array;
    result: Float32Array;
};
export declare const trimAudioWorker: (data: WorkerData<TrimAudioArgs>, abortSignal?: IAbortSignalFast) => WorkerFunctionServerResultSync<TrimAudioResult>;
