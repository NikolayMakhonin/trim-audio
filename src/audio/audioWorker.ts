import {parentPort} from 'worker_threads'
import {
  messagePortToEventBus,
  workerFunctionServer,
} from '@flemist/worker-server'
import {normalizeAmplitudeSimpleWorker} from './normalizeAmplitudeSimple'
import {normalizeAmplitudeWithWindowWorker} from './normalizeAmplitudeWithWindow'
import {normalizeOffsetSimpleWorker} from './normalizeOffsetSimple'
import {normalizeOffsetWithWindowWorker} from './normalizeOffsetWithWindow'
import {smoothAudioWorker} from './smoothAudio'
import {searchContentWorker, trimAudioWorker} from './trimAudio'

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  task    : normalizeAmplitudeSimpleWorker,
})

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  task    : normalizeAmplitudeWithWindowWorker,
})

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  task    : normalizeOffsetSimpleWorker,
})

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  task    : normalizeOffsetWithWindowWorker,
})

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  task    : smoothAudioWorker,
})

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  task    : searchContentWorker,
})

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  task    : trimAudioWorker,
})
