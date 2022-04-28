/* eslint-disable @typescript-eslint/no-shadow */
// from : https://stackoverflow.com/a/59393005/5221762
type TupleItemsAsArray<T extends any[]> = {
  [K in keyof T]: T[K] extends any[] ? T[K][0] : T[K][]
}

export function testVariants<TArgs extends any[]>(
  args: TupleItemsAsArray<TArgs>,
  test: (...args: TArgs) => void,
) {
  const argsLength = args.length
  const totalCounts = []
  let totalCount = 1
  for (let nArg = argsLength - 1; nArg >= 0; nArg--) {
    const count = args[nArg].length
    totalCounts[nArg] = totalCount
    totalCount *= count
  }

  const variantArgs: TArgs = [] as any

  for (let nVariant = 0; nVariant < totalCount; nVariant++) {
    let mod = nVariant
    for (let nArg = 0; nArg < argsLength; nArg++) {
      const _totalCount = totalCounts[nArg]
      const index = (mod / _totalCount)|0
      mod %= _totalCount
      variantArgs[nArg] = args[nArg][index]
    }

    test(...variantArgs)
  }
}

type ObjectItemsAsArray<T extends object> = {
  [K in keyof T]: T[K][]
}

export function testVariants2<TArgs extends object>(
  args: ObjectItemsAsArray<TArgs>,
  test: (args: TArgs) => void,
) {
  const argsKeys = Object.keys(args)
  const argsValues = Object.values(args) as TArgs
  const argsLength = argsKeys.length
  const totalCounts = []
  let totalCount = 1
  for (let nArg = argsLength - 1; nArg >= 0; nArg--) {
    const count = argsValues[nArg].length
    totalCounts[nArg] = totalCount
    totalCount *= count
  }

  const variantArgs: TArgs = {} as any

  for (let nVariant = 0; nVariant < totalCount; nVariant++) {
    let mod = nVariant
    for (let nArg = 0; nArg < argsLength; nArg++) {
      const _totalCount = totalCounts[nArg]
      const index = (mod / _totalCount)|0
      mod %= _totalCount
      const key = argsKeys[nArg]
      variantArgs[key] = argsValues[nArg][index]
    }

    test(variantArgs)
    // test({a: 1, b: '4', c: false} as any)
  }
}

// type Flatten<T> = T extends any[] ? T[number] : T;
//
// type t = Flatten<[string, boolean, number]>

// const tuple = <T extends any[]>(...xs: readonly [...T]): T => xs as T;
//
// const r = tuple('2', 1, false)

// type Flatten<T extends any[]> = {
//   [K in keyof T]: T[K] extends any[] ? T[K][0] : T[K][]
// }
//
// const c: Flatten<[string, number, boolean]> = null
