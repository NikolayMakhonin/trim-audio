import {AudioClientPool} from 'src/audio/AudioClientPool'
import {Pool} from '@flemist/time-limits'

export const audioClient = new AudioClientPool(
  {
    threadsPool: new Pool(1),
    preInit    : false,
    options    : {
      preload : false,
      loglevel: 'warning',
      // log     : false,
      // logger({data: {threadId, type, message}}) {
      // 	console.log(`[${threadId}] [${type}] ${message}`)
      // },
    },
  },
)
