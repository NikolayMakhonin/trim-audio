import { __awaiter } from 'tslib';
import { WorkerClient, workerFunctionClient } from '@flemist/worker-server';
import { audioWorkerPath } from './paths.cjs';

class AudioClient extends WorkerClient {
    constructor({ preInit, options, }) {
        super({
            workerFilePath: audioWorkerPath,
            options: options || {},
            preInit,
        });
    }
    _init(workerEventBus) {
        this._normalizeAmplitudeSimple = workerFunctionClient({
            eventBus: workerEventBus,
            name: 'normalizeAmplitudeSimple',
        });
        this._normalizeAmplitudeWithWindow = workerFunctionClient({
            eventBus: workerEventBus,
            name: 'normalizeAmplitudeWithWindow',
        });
        this._normalizeOffsetSimple = workerFunctionClient({
            eventBus: workerEventBus,
            name: 'normalizeOffsetSimple',
        });
        this._normalizeOffsetWithWindow = workerFunctionClient({
            eventBus: workerEventBus,
            name: 'normalizeOffsetWithWindow',
        });
        this._smoothAudio = workerFunctionClient({
            eventBus: workerEventBus,
            name: 'smoothAudio',
        });
        this._searchContent = workerFunctionClient({
            eventBus: workerEventBus,
            name: 'searchContent',
        });
        this._trimAudio = workerFunctionClient({
            eventBus: workerEventBus,
            name: 'trimAudio',
        });
    }
    normalizeAmplitudeSimple(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const result = yield this._normalizeAmplitudeSimple({
                data: args,
                transferList: [args.samplesData.buffer],
            });
            return result;
        });
    }
    normalizeAmplitudeWithWindow(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const result = yield this._normalizeAmplitudeWithWindow({
                data: args,
                transferList: [args.samplesData.buffer],
            });
            return result;
        });
    }
    normalizeOffsetSimple(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const result = yield this._normalizeOffsetSimple({
                data: args,
                transferList: [args.samplesData.buffer],
            });
            return result;
        });
    }
    normalizeOffsetWithWindow(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const result = yield this._normalizeOffsetWithWindow({
                data: args,
                transferList: [args.samplesData.buffer],
            });
            return result;
        });
    }
    smoothAudio(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const result = yield this._smoothAudio({
                data: args,
                transferList: [args.samplesData.buffer],
            });
            return result;
        });
    }
    searchContent(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const result = yield this._searchContent({
                data: args,
                transferList: [args.samplesData.buffer],
            });
            return result;
        });
    }
    trimAudio(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const result = yield this._trimAudio({
                data: args,
                transferList: [args.samplesData.buffer],
            });
            return result;
        });
    }
    _terminate() {
        this._normalizeAmplitudeSimple = null;
        this._normalizeAmplitudeWithWindow = null;
        this._normalizeOffsetSimple = null;
        this._normalizeOffsetWithWindow = null;
        this._smoothAudio = null;
        this._searchContent = null;
        this._trimAudio = null;
    }
}

export { AudioClient };
