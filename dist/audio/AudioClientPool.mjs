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
            });
        });
    }
    normalizeAmplitudeWithWindow(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.normalizeAmplitudeWithWindow(args);
            });
        });
    }
    normalizeOffsetSimple(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.normalizeOffsetSimple(args);
            });
        });
    }
    normalizeOffsetWithWindow(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.normalizeOffsetWithWindow(args);
            });
        });
    }
    smoothAudio(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.smoothAudio(args);
            });
        });
    }
    searchContent(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.searchContent(args);
            });
        });
    }
    trimAudio(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.trimAudio(args);
            });
        });
    }
}

export { AudioClientPool };
