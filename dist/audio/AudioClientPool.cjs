'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var workerServer = require('@flemist/worker-server');
var audio_AudioClient = require('./AudioClient.cjs');
require('./paths.cjs');

class AudioClientPool extends workerServer.WorkerClientPool {
    constructor({ threadsPool, preInit, options, }) {
        super({
            threadsPool,
            createClient() {
                return new audio_AudioClient.AudioClient({
                    preInit,
                    options,
                });
            },
            preInit,
        });
    }
    normalizeAmplitudeSimple(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.normalizeAmplitudeSimple(args);
            }, args.priority, args.abortSignal);
        });
    }
    normalizeAmplitudeWithWindow(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.normalizeAmplitudeWithWindow(args);
            }, args.priority, args.abortSignal);
        });
    }
    normalizeOffsetSimple(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.normalizeOffsetSimple(args);
            }, args.priority, args.abortSignal);
        });
    }
    normalizeOffsetWithWindow(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.normalizeOffsetWithWindow(args);
            }, args.priority, args.abortSignal);
        });
    }
    smoothAudio(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.smoothAudio(args);
            }, args.priority, args.abortSignal);
        });
    }
    searchContent(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.searchContent(args);
            }, args.priority, args.abortSignal);
        });
    }
    trimAudio(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.trimAudio(args);
            }, args.priority, args.abortSignal);
        });
    }
}

exports.AudioClientPool = AudioClientPool;
