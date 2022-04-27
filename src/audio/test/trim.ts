// import {globby} from 'globby'
// import fse from 'fs-extra'
// import path from 'path'
// import {ffmpegDecode, ffmpegEncode, ffmpegEncodeMp3Params} from '@flemist/ffmpeg-encode-decode'
// import {AudioSamples} from '../contracts'
// import {normalize, trimSamples} from '../trim'
//
// export async function readAudioFile(filePath): Promise<AudioSamples> {
//   const buffer = await fse.readFile(filePath)
//
//   const samples: AudioSamples = await ffmpegDecode(new Uint8Array(buffer), {
//     channels  : 2,
//     sampleRate: 44100,
//   })
//
//   return samples
// }
//
// export async function saveToMp3File(filePath, samples: AudioSamples) {
//   const data: Uint8Array = await ffmpegEncode(samples, {
//     outputFormat: 'mp3', // same as file extension
//     // docs: http://ffmpeg.org/ffmpeg-codecs.html#libmp3lame
//     params      : ffmpegEncodeMp3Params({
//       mode       : 'vbr',
//       vbrQuality : 3,
//       jointStereo: true,
//     }),
//   })
//
//   return fse.writeFile(filePath, data)
// }
//
// export async function trimAudioFile({
//   inputFilePath,
//   outputFilePath,
//   silenceLevelStart,
//   silenceLevelEnd,
// }: {
//   inputFilePath: string,
//   outputFilePath: string,
//   silenceLevelStart?: number,
//   silenceLevelEnd?: number,
// }) {
//   inputFilePath = path.resolve(inputFilePath)
//   outputFilePath = path.resolve(outputFilePath)
//
//   let samples = await readAudioFile(inputFilePath)
//
//   const dir = path.dirname(outputFilePath)
//   if (!fse.existsSync(dir)) {
//     await fse.mkdirp(dir)
//   }
//   if (fse.existsSync(outputFilePath)) {
//     await fse.unlink(outputFilePath)
//   }
//
//   normalize(samples, 0.95)
//   samples = await trimSamples({
//       samples,
//       silenceLevelStart,
//       silenceLevelEnd,
//       minSilenceSamples: Math.round(40 / 1000 * 16000), // 40 ms
//   })
//
//   await saveToMp3File(outputFilePath, samples)
// }
//
// export function trimAudioFilesFromDir({
//   inputDir,
//   inputFilesRelativeGlobs,
//   outputDir,
//   silenceLevelStart,
//   silenceLevelEnd,
// }: {
//   inputDir: string,
//   inputFilesRelativeGlobs: string[],
//   outputDir: string,
//   silenceLevelStart?: number,
//   silenceLevelEnd?: number,
// }) {
//   return trimAudioFiles({
//     inputFilesGlobs: inputFilesRelativeGlobs.map(o => path.resolve(inputDir, o)),
//     getOutputFilePath(filePath) {
//       return path.resolve(outputDir, path.relative(inputDir, filePath))
//         .replace(/\.\w+$/, '') + '.mp3'
//     },
//     silenceLevelStart,
//     silenceLevelEnd,
//   })
// }
//
// export async function trimAudioFiles({
//   inputFilesGlobs,
//   getOutputFilePath,
//   silenceLevelStart,
//   silenceLevelEnd,
// }: {
//   inputFilesGlobs: string[],
//   getOutputFilePath: (inputFilePath: string) => string,
//   silenceLevelStart?: number,
//   silenceLevelEnd?: number,
// }) {
//   const inputFilesPaths = await globby(inputFilesGlobs.map(o => o.replace(/\\/g, '/')))
//
//   await Promise.all(inputFilesPaths.map(async (inputFilePath) => {
//     const outputFilePath = getOutputFilePath(inputFilePath)
//
//     if (fse.existsSync(outputFilePath)) {
//       return
//     }
//
//     try {
//       await trimAudioFile({
//         inputFilePath,
//         outputFilePath,
//         silenceLevelStart,
//         silenceLevelEnd,
//       })
//       console.log('OK: ' + outputFilePath)
//     } catch (err) {
//       console.log('ERROR: ' + inputFilePath + '\r\n' + (err.stack || err.message || err))
//     }
//   }))
//
//   console.log('Completed!')
// }
