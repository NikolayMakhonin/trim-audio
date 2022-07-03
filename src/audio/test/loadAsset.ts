import path from 'path'
import fse from 'fs-extra'
import {assetsPath} from './paths.cjs'

export function getAssetPath(assetFileName: string) {
  const filePath = path.resolve(assetsPath, assetFileName)
  return filePath
}

export async function getAssetData(assetFileName: string) {
  const filePath = getAssetPath(assetFileName)
  const buffer = await fse.readFile(filePath)
  return new Uint8Array(buffer)
}
