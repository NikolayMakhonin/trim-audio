'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var workerServer = require('@flemist/worker-server');
var paths_cjs = require('./paths.cjs');

class AudioClient extends workerServer.WorkerClient {
    constructor({ preInit, options, }) {
        super({
            workerFilePath: paths_cjs.audioWorkerPath,
            options: options || {},
            preInit,
        });
    }
    _init(workerEventBus) {
        this._normalizeAmplitudeSimple = workerServer.workerFunctionClient({
            eventBus: workerEventBus,
            name: 'normalizeAmplitudeSimple',
        });
        this._normalizeAmplitudeWithWindow = workerServer.workerFunctionClient({
            eventBus: workerEventBus,
            name: 'normalizeAmplitudeWithWindow',
        });
        this._normalizeOffsetSimple = workerServer.workerFunctionClient({
            eventBus: workerEventBus,
            name: 'normalizeOffsetSimple',
        });
        this._normalizeOffsetWithWindow = workerServer.workerFunctionClient({
            eventBus: workerEventBus,
            name: 'normalizeOffsetWithWindow',
        });
        this._smoothAudio = workerServer.workerFunctionClient({
            eventBus: workerEventBus,
            name: 'smoothAudio',
        });
        this._searchContent = workerServer.workerFunctionClient({
            eventBus: workerEventBus,
            name: 'searchContent',
        });
        this._trimAudio = workerServer.workerFunctionClient({
            eventBus: workerEventBus,
            name: 'trimAudio',
        });
    }
    normalizeAmplitudeSimple(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const result = yield this._normalizeAmplitudeSimple({
                data: args,
                transferList: [args.samplesData.buffer],
            });
            return result;
        });
    }
    normalizeAmplitudeWithWindow(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const result = yield this._normalizeAmplitudeWithWindow({
                data: args,
                transferList: [args.samplesData.buffer],
            });
            return result;
        });
    }
    normalizeOffsetSimple(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const result = yield this._normalizeOffsetSimple({
                data: args,
                transferList: [args.samplesData.buffer],
            });
            return result;
        });
    }
    normalizeOffsetWithWindow(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const result = yield this._normalizeOffsetWithWindow({
                data: args,
                transferList: [args.samplesData.buffer],
            });
            return result;
        });
    }
    smoothAudio(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const result = yield this._smoothAudio({
                data: args,
                transferList: [args.samplesData.buffer],
            });
            return result;
        });
    }
    searchContent(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const result = yield this._searchContent({
                data: args,
                transferList: [args.samplesData.buffer],
            });
            return result;
        });
    }
    trimAudio(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
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

exports.AudioClient = AudioClient;
