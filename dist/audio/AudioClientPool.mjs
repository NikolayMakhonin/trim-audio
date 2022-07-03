import { __awaiter } from 'tslib';
import { WorkerClientPool } from '@flemist/worker-server';
import { AudioClient } from './AudioClient.mjs';
import './paths.cjs';

class AudioClientPool extends WorkerClientPool {
    constructor({ threadsPool, preInit, options, }) {
        super({
            threadsPool,
            createClient() {
                return new AudioClient({
                    preInit,
                    options,
                });
            },
            preInit,
        });
    }
    normalizeAmplitudeSimple(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.normalizeAmplitudeSimple(args);
            }, args.priority, args.abortSignal);
        });
    }
    normalizeAmplitudeWithWindow(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.normalizeAmplitudeWithWindow(args);
            }, args.priority, args.abortSignal);
        });
    }
    normalizeOffsetSimple(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.normalizeOffsetSimple(args);
            }, args.priority, args.abortSignal);
        });
    }
    normalizeOffsetWithWindow(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.normalizeOffsetWithWindow(args);
            }, args.priority, args.abortSignal);
        });
    }
    smoothAudio(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.smoothAudio(args);
            }, args.priority, args.abortSignal);
        });
    }
    searchContent(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.searchContent(args);
            }, args.priority, args.abortSignal);
        });
    }
    trimAudio(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.trimAudio(args);
            }, args.priority, args.abortSignal);
        });
    }
}

export { AudioClientPool };
