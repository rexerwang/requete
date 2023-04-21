export function toAny(v: any) {
  return v as any
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
