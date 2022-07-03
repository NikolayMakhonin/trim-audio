import { WorkerData, WorkerFunctionServerResultSync } from '@flemist/worker-server';
import { IAbortSignalFast } from '@flemist/abort-controller-fast';
import { Priority } from '@flemist/priority-queue';
export declare type NormalizeOffsetWithWindowArgs = {
    samplesData: Float32Array;
    channelsCount: number;
    channels?: number[];
    windowSamples: number;
    priority?: Priority;
    abortSignal?: IAbortSignalFast;
};
export declare function normalizeOffsetWithWindow(args: NormalizeOffsetWithWindowArgs): void;
export declare const normalizeOffsetWithWindowWorker: (data: WorkerData<NormalizeOffsetWithWindowArgs>, abortSignal?: IAbortSignalFast) => WorkerFunctionServerResultSync<Float32Array>;
