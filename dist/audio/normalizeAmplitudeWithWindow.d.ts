import type { WorkerData, WorkerFunctionServerResultSync } from '@flemist/worker-server';
import type { IAbortSignalFast } from '@flemist/abort-controller-fast';
import { Priority } from '@flemist/priority-queue';
export declare type NormalizeAmplitudeWithWindowArgs = {
    samplesData: Float32Array;
    channelsCount: number;
    channels?: number[];
    separateChannels?: boolean;
    coef: number;
    maxMult?: number;
    windowSamples: number;
    priority?: Priority;
    abortSignal?: IAbortSignalFast;
};
export declare function normalizeAmplitudeWithWindow(args: NormalizeAmplitudeWithWindowArgs): void;
export declare const normalizeAmplitudeWithWindowWorker: (data: WorkerData<NormalizeAmplitudeWithWindowArgs>, abortSignal?: IAbortSignalFast) => WorkerFunctionServerResultSync<Float32Array>;
