import { FetchAdapter } from './FetchAdapter'
import { XhrAdapter } from './XhrAdapter'

export function createAdapter() {
  const SupportedAdapter = [FetchAdapter, XhrAdapter].find((i) => i.supported)
  if (!SupportedAdapter)
    throw new ReferenceError('No adapter supported in current environment.')
  return new SupportedAdapter()
}

export * from './Adapter'
export * from './FetchAdapter'
export * from './XhrAdapter'
