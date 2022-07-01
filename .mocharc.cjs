'use strict'

module.exports = {
  require: [
    'tsconfig-paths/register',
    'ts-node/register',
    '@flemist/test-utils/register',
  ],
  'watch-files': ['./src/**'],
  ignore       : ['./**/*.d.ts'],
  'node-option': [
    // 'prof',
    'trace-warnings',
    // 'experimental-wasm-threads',
    // 'experimental-wasm-bulk-memory',
    // 'max-old-space-size=8192',
  ],
}
