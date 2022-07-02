import { WorkerData, WorkerFunctionServerResultSync } from '@flemist/worker-server';
import { IAbortSignalFast } from '@flemist/abort-controller-fast';
export declare type NormalizeOffsetSimpleArgs = {
    samplesData: Float32Array;
    channelsCount: number;
    channels?: number[];
};
export declare function normalizeOffsetSimple(args: NormalizeOffsetSimpleArgs): void;
export declare const normalizeOffsetSimpleWorker: (data: WorkerData<NormalizeOffsetSimpleArgs>, abortSignal?: IAbortSignalFast) => WorkerFunctionServerResultSync<Float32Array>;
