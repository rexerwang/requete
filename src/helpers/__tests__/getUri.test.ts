import { toAny } from 'test/utils'

import { getUri } from '../getUri'

describe('getUri specs', () => {
  it('should not join when given a absolute url', () => {
    expect(
      getUri(
        toAny({
          baseURL: 'https://requete.com',
          url: 'https://api.com/api/v1/posts',
        })
      )
    ).toBe('https://api.com/api/v1/posts')
  })

  it('should not join when baseURL is falsy', () => {
    expect(
      getUri(
        toAny({
          baseURL: undefined,
          url: '/api/v1/posts',
        })
      )
    ).toBe('/api/v1/posts')

    expect(
      getUri(
        toAny({
          baseURL: '',
          url: '/api/v1/posts',
        })
      )
    ).toBe('/api/v1/posts')
  })

  it('should join with baseURL with separator', () => {
    expect(
      getUri(
        toAny({
          baseURL: 'https://requete.com/',
          url: '/api/v1/posts',
        })
      )
    ).toBe('https://requete.com/api/v1/posts')

    expect(
      getUri(
        toAny({
          baseURL: 'https://requete.com/',
          url: '//api/v1/posts/',
        })
      )
    ).toBe('https://requete.com/api/v1/posts/')

    expect(
      getUri(
        toAny({
          baseURL: 'https://requete.com//',
          url: '//api/v1/posts/',
        })
      )
    ).toBe('https://requete.com/api/v1/posts/')
  })

  it('should join url with query-string when given string params', () => {
    expect(
      getUri(
        toAny({
          url: 'https://requete.com/api/v1/posts',
          params: 'a=1',
        })
      )
    ).toBe('https://requete.com/api/v1/posts?a=1')

    expect(
      getUri(
        toAny({
          url: 'https://requete.com/api/v1/posts',
          params: '?a=1',
        })
      )
    ).toBe('https://requete.com/api/v1/posts?a=1')
  })

  it('should join url with query-string when given object params', () => {
    expect(
      getUri(
        toAny({
          url: 'https://requete.com/api/v1/posts',
          params: { a: 1, b: 2 },
        })
      )
    ).toBe('https://requete.com/api/v1/posts?a=1&b=2')
  })

  it('should join url with query-string when given url with params & config.params', () => {
    expect(
      getUri(
        toAny({
          url: 'https://requete.com/api/v1/posts?c=3',
          params: { a: 1, b: 2 },
        })
      )
    ).toBe('https://requete.com/api/v1/posts?c=3&a=1&b=2')
  })

  it('should overwrite origin url params when given same keys in params', () => {
    expect(
      getUri(
        toAny({
          url: 'https://requete.com/api/v1/posts?a=3',
          params: { a: 1, b: 2, c: 4 },
        })
      )
    ).toBe('https://requete.com/api/v1/posts?a=1&b=2&c=4')
  })
})
