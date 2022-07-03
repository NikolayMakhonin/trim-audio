import { WorkerData, WorkerFunctionServerResultSync } from '@flemist/worker-server';
import { IAbortSignalFast } from '@flemist/abort-controller-fast';
import { Priority } from '@flemist/priority-queue';
export declare type NormalizeOffsetSimpleArgs = {
    samplesData: Float32Array;
    channelsCount: number;
    channels?: number[];
    priority?: Priority;
    abortSignal?: IAbortSignalFast;
};
export declare function normalizeOffsetSimple(args: NormalizeOffsetSimpleArgs): void;
export declare const normalizeOffsetSimpleWorker: (data: WorkerData<NormalizeOffsetSimpleArgs>, abortSignal?: IAbortSignalFast) => WorkerFunctionServerResultSync<Float32Array>;
