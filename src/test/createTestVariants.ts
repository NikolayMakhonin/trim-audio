/* eslint-disable @typescript-eslint/no-shadow */

type Func<This, Args extends any[], Result> = (this: This, ...args: Args) => Result

type ArrayItem<T> = T extends Array<infer T> ? T : never

type ArrayOrFuncItem<T> = T extends Array<infer T> ? T
  : T extends Func<any, any[], infer T> ? ArrayItem<T>
    : never

type VariantArgValues<TArgs, T> = T[] | ((args: TArgs) => T[])

type VariantsArgs<TArgs> = {
  [key in keyof TArgs]: TArgs[key][] | ((args: TArgs) => TArgs[key][])
}

type VariantsArgsOf<T> =
  T extends VariantsArgs<infer T> ? T : never

export function createTestVariants<TArgs extends object>(
  test: (args: TArgs) => void,
): ((args: VariantsArgs<TArgs>) => void) {
  return function _testVariants(args) {
    const argsKeys = Object.keys(args)
    const argsValues = Object.values(args) as any[]
    const argsLength = argsKeys.length

    const variantArgs: TArgs = {} as any

    function getArgValues(nArg: number) {
      let argValues = argsValues[nArg]
      if (typeof argValues === 'function') {
        argValues = argValues(variantArgs)
      }
      return argValues
    }

    const indexes: number[] = []
    const values: any[][] = []
    for (let nArg = 0; nArg < argsLength; nArg++) {
      indexes[nArg] = -1
      values[nArg] = []
    }
    values[0] = getArgValues(0)

    function nextVariant() {
      for (let nArg = argsLength - 1; nArg >= 0; nArg--) {
        const index = indexes[nArg] + 1
        if (index < values[nArg].length) {
          indexes[nArg] = index
          variantArgs[argsKeys[nArg]] = values[nArg][index]
          for (nArg++; nArg < argsLength; nArg++) {
            const argValues = getArgValues(nArg)
            if (argValues.length === 0) {
              break
            }
            indexes[nArg] = 0
            values[nArg] = argValues
            variantArgs[argsKeys[nArg]] = argValues[0]
          }
          if (nArg >= argsLength) {
            return true
          }
        }
      }

      return false
    }

    while (nextVariant()) {
      test(variantArgs)
    }
  }
}
