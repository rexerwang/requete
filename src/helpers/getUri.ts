import qs from 'query-string'

import { IRequest } from '../types'

export function getUri(config: IRequest) {
  let url = config.url

  if (!url.includes('://') && config.baseURL) {
    url = config.baseURL.replace(/\/+$/, '') + '/' + url.replace(/^\//, '')
  }

  if (config.params) {
    const query =
      typeof config.params === 'string'
        ? qs.parse(config.params)
        : config.params
    url = qs.stringifyUrl({ url, query })
  }

  return url
}
