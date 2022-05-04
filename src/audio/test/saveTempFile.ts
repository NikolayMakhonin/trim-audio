import path from 'path'
import fse from 'fs-extra'

export function getTempFilePath(fileName: string) {
  return path.resolve('./tmp/', path.relative('./src', path.resolve(__dirname, 'assets', fileName)))
}

export async function saveTempFile(fileName: string, data: any) {
  const outputFilePath = getTempFilePath(fileName)
  if (fse.existsSync(outputFilePath)) {
    await fse.unlink(outputFilePath)
  }
  const dir = path.dirname(outputFilePath)
  if (!fse.existsSync(dir)) {
    await fse.mkdirp(dir)
  }
  await fse.writeFile(outputFilePath, data)
}
