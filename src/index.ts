import { create } from './core/create'

export default create()

export * from './core/AbortController'
export * from './core/create'
export * from './core/Requete'
export { FetchAdapter, XhrAdapter } from 'requete/adapter'
export { RequestError } from 'requete/shared'
