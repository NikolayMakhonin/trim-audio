import { WorkerData, WorkerFunctionServerResultSync } from '@flemist/worker-server';
import { IAbortSignalFast } from '@flemist/abort-controller-fast';
import { Priority } from '@flemist/priority-queue';
export declare type SmoothAudioArgs = {
    samplesData: Float32Array;
    channelsCount: number;
    channels?: number[];
    startSamples: number;
    endSamples: number;
    priority?: Priority;
    abortSignal?: IAbortSignalFast;
};
export declare function smoothAudio(args: SmoothAudioArgs): void;
export declare const smoothAudioWorker: (data: WorkerData<SmoothAudioArgs>, abortSignal?: IAbortSignalFast) => WorkerFunctionServerResultSync<Float32Array>;
