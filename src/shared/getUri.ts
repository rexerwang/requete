import type { IRequest } from 'requete'

function stringifyUrl(url: string, query: NonNullable<IRequest['params']>) {
  let searchParams: URLSearchParams

  if (query instanceof URLSearchParams) {
    searchParams = query
  } else if (typeof query === 'string' || Array.isArray(query)) {
    searchParams = new URLSearchParams(query)
  } else {
    searchParams = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => searchParams.append(key, val.toString()))
      } else if (value != null) {
        searchParams.set(key, value.toString())
      }
    })
  }

  return url + (url.indexOf('?') === -1 ? '?' : '&') + searchParams.toString()
}

function isAbsolute(url: string) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url)
}

export function getUri(config: IRequest) {
  let url = config.url

  const hashIndex = url.indexOf('#')
  if (hashIndex > -1) url = url.slice(0, hashIndex)

  if (!isAbsolute(url) && config.baseURL) {
    url = config.baseURL.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '')
  }

  if (config.params) {
    url = stringifyUrl(url, config.params)
  }

  return url
}
