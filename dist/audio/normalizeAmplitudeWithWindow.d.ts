export declare function normalizeAmplitudeWithWindow({ samplesData, channelsCount, channels, separateChannels, coef, maxMult, windowSamples, }: {
    samplesData: Float32Array;
    channelsCount: number;
    channels?: number[];
    separateChannels?: boolean;
    coef: number;
    maxMult?: number;
    windowSamples: number;
}): void;
