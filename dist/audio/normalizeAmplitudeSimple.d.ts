import type { WorkerData, WorkerFunctionServerResultSync } from '@flemist/worker-server';
import type { IAbortSignalFast } from '@flemist/abort-controller-fast';
export declare type NormalizeAmplitudeSimpleArgs = {
    samplesData: Float32Array;
    channelsCount: number;
    channels?: number[];
    separateChannels?: boolean;
    coef: number;
};
export declare function normalizeAmplitudeSimple(args: NormalizeAmplitudeSimpleArgs): void;
export declare const normalizeAmplitudeSimpleWorker: (data: WorkerData<NormalizeAmplitudeSimpleArgs>, abortSignal?: IAbortSignalFast) => WorkerFunctionServerResultSync<Float32Array>;
