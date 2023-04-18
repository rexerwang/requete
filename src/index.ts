import { Requete } from './core/Requete'
import type { RequestConfig } from './types'

export * from './adapter'
export * from './core/AbortController'
export * from './core/RequestError'
export * from './core/Requete'
export * from './types'

export function create(config?: RequestConfig) {
  return new Requete(config)
}

export default create()
