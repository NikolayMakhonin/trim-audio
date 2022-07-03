'use strict'

const path = require('path')
const audioWorkerPath = path.resolve(__dirname, '../../dist/audio/audioWorker.cjs')

module.exports = {
  audioWorkerPath,
}
