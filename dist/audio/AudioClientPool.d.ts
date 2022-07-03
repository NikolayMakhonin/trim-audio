import { WorkerClientPool } from '@flemist/worker-server';
import { IPool } from '@flemist/time-limits';
import { NormalizeAmplitudeSimpleArgs } from "./normalizeAmplitudeSimple";
import { NormalizeAmplitudeWithWindowArgs } from "./normalizeAmplitudeWithWindow";
import { NormalizeOffsetSimpleArgs } from "./normalizeOffsetSimple";
import { NormalizeOffsetWithWindowArgs } from "./normalizeOffsetWithWindow";
import { SmoothAudioArgs } from "./smoothAudio";
import { SearchContentArgs, TrimAudioArgs } from "./trimAudio";
import { AudioClient, IAudioClient, TAudioClientOptions } from "./AudioClient";
export declare class AudioClientPool extends WorkerClientPool<AudioClient> implements IAudioClient {
    constructor({ threadsPool, preInit, options, }: {
        threadsPool: IPool;
        preInit?: boolean;
        options?: TAudioClientOptions;
    });
    normalizeAmplitudeSimple(args: NormalizeAmplitudeSimpleArgs): Promise<import("@flemist/worker-server").WorkerData<Float32Array>>;
    normalizeAmplitudeWithWindow(args: NormalizeAmplitudeWithWindowArgs): Promise<import("@flemist/worker-server").WorkerData<Float32Array>>;
    normalizeOffsetSimple(args: NormalizeOffsetSimpleArgs): Promise<import("@flemist/worker-server").WorkerData<Float32Array>>;
    normalizeOffsetWithWindow(args: NormalizeOffsetWithWindowArgs): Promise<import("@flemist/worker-server").WorkerData<Float32Array>>;
    smoothAudio(args: SmoothAudioArgs): Promise<import("@flemist/worker-server").WorkerData<Float32Array>>;
    searchContent(args: SearchContentArgs): Promise<import("@flemist/worker-server").WorkerData<import("./trimAudio").SearchContentResult>>;
    trimAudio(args: TrimAudioArgs): Promise<import("@flemist/worker-server").WorkerData<import("./trimAudio").TrimAudioResult>>;
}
