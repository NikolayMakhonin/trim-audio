export const EPSILON = 1e-16

export function checkIsNumber(value: number) {
  if (typeof value !== 'number' || (value === value) === false) {
    throw new Error('value === ' + value)
  }
  return value
}

export function correctSample(value: number) {
  value = checkIsNumber(value)
  if (value > 1) {
    throw new Error('value === ' + value)
    // value = 1
  }
  if (value < -1) {
    throw new Error('value === ' + value)
    // value = -1
  }
  return value
}

export function generateIndexArray(length: number): number[] {
  const array = []
  for (let i = 0; i < length; i++) {
    array[i] = i
  }
  return array
}
