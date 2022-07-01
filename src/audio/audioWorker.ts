import {normalizeAmplitudeSimple} from './normalizeAmplitudeSimple'
import {
  messagePortToEventBus,
  workerFunctionServer,
} from '@flemist/worker-server'
import {parentPort} from 'worker_threads'

workerFunctionServer({
  eventBus: messagePortToEventBus(parentPort),
  task    : normalizeAmplitudeSimple,
})
