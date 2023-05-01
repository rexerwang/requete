import type { IRequest } from 'requete'

function stringifyUrl(target: string, query: NonNullable<IRequest['params']>) {
  const [url, search] = target.split('?')
  const searchParams = new URLSearchParams(search)
  if (typeof query === 'string') {
    new URLSearchParams(query).forEach((value, key) => {
      searchParams.set(key, value)
    })
  } else {
    Object.entries(query).forEach(([key, value]) => {
      searchParams.set(key, encodeURIComponent(value))
    })
  }

  return url + '?' + searchParams.toString()
}

function isAbsolute(url: string) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url)
}

export function getUri(config: IRequest) {
  let url = config.url

  if (!isAbsolute(url) && config.baseURL) {
    url = config.baseURL.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '')
  }

  if (config.params) {
    url = stringifyUrl(url, config.params)
  }

  return url
}
