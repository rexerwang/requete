import { getUri, stringifyUrl } from '../url'

describe('getUri specs', () => {
  it('should not join when given a absolute url', () => {
    expect(
      getUri({
        baseURL: 'https://example.com',
        url: 'https://api.com/api/v1/posts',
      })
    ).toBe('https://api.com/api/v1/posts')

    expect(
      getUri({
        baseURL: 'https://example.com',
        url: '//api.com/api/v1/posts',
      })
    ).toBe('//api.com/api/v1/posts')
  })

  it('should not join when baseURL is falsy', () => {
    expect(
      getUri({
        baseURL: undefined,
        url: '/api/v1/posts',
      })
    ).toBe('/api/v1/posts')

    expect(
      getUri({
        baseURL: '',
        url: '/api/v1/posts',
      })
    ).toBe('/api/v1/posts')
  })

  it('should join with baseURL with separator', () => {
    expect(
      getUri({
        baseURL: 'https://example.com/',
        url: '/api/v1/posts#t=1',
      })
    ).toBe('https://example.com/api/v1/posts')

    expect(
      getUri({
        baseURL: 'https://example.com//',
        url: '/api/v1/posts/',
      })
    ).toBe('https://example.com/api/v1/posts/')
  })

  it('should join url with query-string when given string params', () => {
    expect(
      getUri({
        url: 'https://example.com/api/v1/posts',
        params: 'a=1',
      })
    ).toBe('https://example.com/api/v1/posts?a=1')

    expect(
      getUri({
        url: 'https://example.com/api/v1/posts?t=123',
        params: '?a=1',
      })
    ).toBe('https://example.com/api/v1/posts?t=123&a=1')
  })

  it('should join url with query-string when given object params', () => {
    expect(
      getUri({
        url: 'https://example.com/api/v1/posts',
        params: {
          a: '1+1',
          b: '2 1',
          c: null,
          d: undefined,
          arr: [1, 2, 3],
        },
      })
    ).toBe('https://example.com/api/v1/posts?a=1%2B1&b=2+1&arr=1&arr=2&arr=3')
  })

  it('should join url with query-string when given the URLSearchParams', () => {
    expect(
      getUri({
        url: 'https://example.com/api/v1/posts',
        params: new URLSearchParams({ a: '1', b: '2' }),
      })
    ).toBe('https://example.com/api/v1/posts?a=1&b=2')
  })
})

describe('stringifyUrl specs', () => {
  it('should overwrite the duplicated key-values when given a url having search-params if not append', () => {
    expect(
      stringifyUrl(
        'https://example.com?a=a&b=b&t=1',
        { a: 1, b: 2, c: 3 },
        false
      )
    ).toBe('https://example.com?a=1&b=2&t=1&c=3')
  })
})
