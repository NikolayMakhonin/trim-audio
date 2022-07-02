import { WorkerData, WorkerFunctionServerResultSync } from '@flemist/worker-server';
import { IAbortSignalFast } from '@flemist/abort-controller-fast';
export declare type SmoothAudioArgs = {
    samplesData: Float32Array;
    channelsCount: number;
    channels?: number[];
    startSamples: number;
    endSamples: number;
};
export declare function smoothAudio(args: SmoothAudioArgs): void;
export declare const smoothAudioWorker: (data: WorkerData<SmoothAudioArgs>, abortSignal?: IAbortSignalFast) => WorkerFunctionServerResultSync<Float32Array>;
