export function pick<T extends object, K extends keyof T>(
  object: T,
  keys: K[]
): Pick<T, K> {
  const partial: any = {}
  keys.forEach((key) => {
    partial[key] = object[key]
  })

  return partial
}
