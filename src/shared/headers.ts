export function mergeHeaders(...headers: (HeadersInit | undefined)[]) {
  return headers.filter(Boolean).reduce((res: Headers, header) => {
    new Headers(header).forEach((value, key) => res.set(key, value))
    return res
  }, new Headers())
}

export function parseHeaders(rawText?: string) {
  const headers = new Headers()
  if (!rawText) return headers

  rawText
    .trim()
    .split(/[\r\n]+/)
    .forEach((header) => {
      const [key, value] = header.split(': ').map((s) => s.trim())
      headers.append(key, value)
    })

  return headers
}
