import type { IRequest, RequestQuery } from 'requete'

export function stringifyUrl(url: string, query: RequestQuery, append = true) {
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

  const qIndex = url.indexOf('?')

  if (qIndex === -1) return url + '?' + searchParams.toString()
  if (append) return url + '&' + searchParams.toString()
  else {
    const params = new URLSearchParams(url.slice(qIndex))
    searchParams.forEach((value, key) => params.set(key, value.toString()))
    return url.slice(0, qIndex) + '?' + params.toString()
  }
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
