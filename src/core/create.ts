import { RequestConfig, Requete } from './Requete'

export function create(config?: RequestConfig) {
  return new Requete(config)
}
