import { parentPort } from 'worker_threads';
import { workerFunctionServer, messagePortToEventBus } from '@flemist/worker-server';
import { normalizeAmplitudeSimpleWorker } from './normalizeAmplitudeSimple.mjs';
import { normalizeAmplitudeWithWindowWorker } from './normalizeAmplitudeWithWindow.mjs';
import { normalizeOffsetSimpleWorker } from './normalizeOffsetSimple.mjs';
import { normalizeOffsetWithWindowWorker } from './normalizeOffsetWithWindow.mjs';
import { smoothAudioWorker } from './smoothAudio.mjs';
import { searchContentWorker, trimAudioWorker } from './trimAudio.mjs';
import './helpers.mjs';

workerFunctionServer({
    eventBus: messagePortToEventBus(parentPort),
    task: normalizeAmplitudeSimpleWorker,
});
workerFunctionServer({
    eventBus: messagePortToEventBus(parentPort),
    task: normalizeAmplitudeWithWindowWorker,
});
workerFunctionServer({
    eventBus: messagePortToEventBus(parentPort),
    task: normalizeOffsetSimpleWorker,
});
workerFunctionServer({
    eventBus: messagePortToEventBus(parentPort),
    task: normalizeOffsetWithWindowWorker,
});
workerFunctionServer({
    eventBus: messagePortToEventBus(parentPort),
    task: smoothAudioWorker,
});
workerFunctionServer({
    eventBus: messagePortToEventBus(parentPort),
    task: searchContentWorker,
});
workerFunctionServer({
    eventBus: messagePortToEventBus(parentPort),
    task: trimAudioWorker,
});
