import { HttpRequest } from './core/HttpRequest'
import type { RequestConfig } from './types'

export * from './adapter'
export * from './core/AbortController'
export * from './core/HttpRequest'
export * from './core/RequestError'
export * from './types'

export function create(config?: RequestConfig) {
  return new HttpRequest(config)
}
