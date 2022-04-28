/* eslint-disable @typescript-eslint/no-shadow */
export function testVariants<TArgs extends object>(
  args: { [key in keyof TArgs]: TArgs[key][] | ((args: TArgs) => TArgs[key][]) },
  test: (args: TArgs) => void,
) {
  const argsKeys = Object.keys(args)
  const argsValues = Object.values(args) as TArgs
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
