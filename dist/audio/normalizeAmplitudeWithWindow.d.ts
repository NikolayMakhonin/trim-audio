import { WorkerData, WorkerFunctionServerResultSync } from '@flemist/worker-server';
import { IAbortSignalFast } from '@flemist/abort-controller-fast';
export declare type NormalizeAmplitudeWithWindowArgs = {
    samplesData: Float32Array;
    channelsCount: number;
    channels?: number[];
    separateChannels?: boolean;
    coef: number;
    maxMult?: number;
    windowSamples: number;
};
export declare function normalizeAmplitudeWithWindow(args: NormalizeAmplitudeWithWindowArgs): void;
export declare const normalizeAmplitudeWithWindowWorker: (data: WorkerData<NormalizeAmplitudeWithWindowArgs>, abortSignal?: IAbortSignalFast) => WorkerFunctionServerResultSync<Float32Array>;
