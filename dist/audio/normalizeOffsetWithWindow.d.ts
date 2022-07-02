import { WorkerData, WorkerFunctionServerResultSync } from '@flemist/worker-server';
import { IAbortSignalFast } from '@flemist/abort-controller-fast';
export declare type NormalizeOffsetWithWindowArgs = {
    samplesData: Float32Array;
    channelsCount: number;
    channels?: number[];
    windowSamples: number;
};
export declare function normalizeOffsetWithWindow(args: NormalizeOffsetWithWindowArgs): void;
export declare const normalizeOffsetWithWindowWorker: (data: WorkerData<NormalizeOffsetWithWindowArgs>, abortSignal?: IAbortSignalFast) => WorkerFunctionServerResultSync<Float32Array>;
