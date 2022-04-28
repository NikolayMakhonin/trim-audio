/* eslint-disable @typescript-eslint/no-shadow */
export function testVariants<TArgs extends any[]>(
  args: [TArgs[0][], TArgs[1][], TArgs[2][]],
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
