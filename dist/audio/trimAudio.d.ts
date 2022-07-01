export declare function searchContent({ samplesData, channelsCount, samplesCount, channels, windowSamples, backward, minContentSamples, minContentDispersion, maxSilenceSamples, start, endExclusive, }: {
    samplesData: Float32Array;
    channelsCount: number;
    samplesCount: number;
    channels?: number[];
    windowSamples: number;
    backward: boolean;
    minContentSamples: number;
    minContentDispersion: number;
    maxSilenceSamples: number;
    start?: number;
    endExclusive?: number;
}): number;
export declare function trimAudio({ samplesData, channelsCount, channels, start, end, }: {
    samplesData: Float32Array;
    channelsCount: number;
    channels?: number[];
    start?: {
        windowSamples: number;
        minContentSamples: number;
        minContentDispersion: number;
        maxSilenceSamples: number;
        space: number;
    };
    end?: {
        windowSamples: number;
        minContentSamples: number;
        minContentDispersion: number;
        maxSilenceSamples: number;
        space: number;
    };
}): Float32Array;
