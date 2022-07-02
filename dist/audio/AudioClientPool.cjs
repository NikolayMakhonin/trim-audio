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
            });
        });
    }
    normalizeAmplitudeWithWindow(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.normalizeAmplitudeWithWindow(args);
            });
        });
    }
    normalizeOffsetSimple(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.normalizeOffsetSimple(args);
            });
        });
    }
    normalizeOffsetWithWindow(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.normalizeOffsetWithWindow(args);
            });
        });
    }
    smoothAudio(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.smoothAudio(args);
            });
        });
    }
    searchContent(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.searchContent(args);
            });
        });
    }
    trimAudio(args) {
        return tslib.__awaiter(this, void 0, void 0, function* () {
            return this.use(1, ([client]) => {
                return client.trimAudio(args);
            });
        });
    }
}

exports.AudioClientPool = AudioClientPool;
