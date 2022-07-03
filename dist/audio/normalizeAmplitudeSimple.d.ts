import type { WorkerData, WorkerFunctionServerResultSync } from '@flemist/worker-server';
import type { IAbortSignalFast } from '@flemist/abort-controller-fast';
import { Priority } from '@flemist/priority-queue';
export declare type NormalizeAmplitudeSimpleArgs = {
    samplesData: Float32Array;
    channelsCount: number;
    channels?: number[];
    separateChannels?: boolean;
    coef: number;
    priority?: Priority;
    abortSignal?: IAbortSignalFast;
};
export declare function normalizeAmplitudeSimple(args: NormalizeAmplitudeSimpleArgs): void;
export declare const normalizeAmplitudeSimpleWorker: (data: WorkerData<NormalizeAmplitudeSimpleArgs>, abortSignal?: IAbortSignalFast) => WorkerFunctionServerResultSync<Float32Array>;
