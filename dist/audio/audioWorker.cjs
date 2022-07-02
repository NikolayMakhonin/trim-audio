'use strict';

var worker_threads = require('worker_threads');
var workerServer = require('@flemist/worker-server');
var audio_normalizeAmplitudeSimple = require('./normalizeAmplitudeSimple.cjs');
var audio_normalizeAmplitudeWithWindow = require('./normalizeAmplitudeWithWindow.cjs');
var audio_normalizeOffsetSimple = require('./normalizeOffsetSimple.cjs');
var audio_normalizeOffsetWithWindow = require('./normalizeOffsetWithWindow.cjs');
var audio_smoothAudio = require('./smoothAudio.cjs');
var audio_trimAudio = require('./trimAudio.cjs');
require('./helpers.cjs');

workerServer.workerFunctionServer({
    eventBus: workerServer.messagePortToEventBus(worker_threads.parentPort),
    task: audio_normalizeAmplitudeSimple.normalizeAmplitudeSimpleWorker,
});
workerServer.workerFunctionServer({
    eventBus: workerServer.messagePortToEventBus(worker_threads.parentPort),
    task: audio_normalizeAmplitudeWithWindow.normalizeAmplitudeWithWindowWorker,
});
workerServer.workerFunctionServer({
    eventBus: workerServer.messagePortToEventBus(worker_threads.parentPort),
    task: audio_normalizeOffsetSimple.normalizeOffsetSimpleWorker,
});
workerServer.workerFunctionServer({
    eventBus: workerServer.messagePortToEventBus(worker_threads.parentPort),
    task: audio_normalizeOffsetWithWindow.normalizeOffsetWithWindowWorker,
});
workerServer.workerFunctionServer({
    eventBus: workerServer.messagePortToEventBus(worker_threads.parentPort),
    task: audio_smoothAudio.smoothAudioWorker,
});
workerServer.workerFunctionServer({
    eventBus: workerServer.messagePortToEventBus(worker_threads.parentPort),
    task: audio_trimAudio.searchContentWorker,
});
workerServer.workerFunctionServer({
    eventBus: workerServer.messagePortToEventBus(worker_threads.parentPort),
    task: audio_trimAudio.trimAudioWorker,
});
