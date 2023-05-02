import { getUri } from '../getUri'

describe('getUri specs', () => {
  it('should not join when given a absolute url', () => {
    expect(
      getUri({
        baseURL: 'https://requete.com',
        url: 'https://api.com/api/v1/posts',
      })
    ).toBe('https://api.com/api/v1/posts')

    expect(
      getUri({
        baseURL: 'https://requete.com',
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
        baseURL: 'https://requete.com/',
        url: '/api/v1/posts#t=1',
      })
    ).toBe('https://requete.com/api/v1/posts')

    expect(
      getUri({
        baseURL: 'https://requete.com//',
        url: '/api/v1/posts/',
      })
    ).toBe('https://requete.com/api/v1/posts/')
  })

  it('should join url with query-string when given string params', () => {
    expect(
      getUri({
        url: 'https://requete.com/api/v1/posts',
        params: 'a=1',
      })
    ).toBe('https://requete.com/api/v1/posts?a=1')

    expect(
      getUri({
        url: 'https://requete.com/api/v1/posts?t=123',
        params: '?a=1',
      })
    ).toBe('https://requete.com/api/v1/posts?t=123&a=1')
  })

  it('should join url with query-string when given object params', () => {
    expect(
      getUri({
        url: 'https://requete.com/api/v1/posts',
        params: {
          a: '1+1',
          b: '2 1',
          c: null,
          d: undefined,
          arr: [1, 2, 3],
        },
      })
    ).toBe('https://requete.com/api/v1/posts?a=1%2B1&b=2+1&arr=1&arr=2&arr=3')
  })

  it('should join url with query-string when given the URLSearchParams', () => {
    expect(
      getUri({
        url: 'https://requete.com/api/v1/posts',
        params: new URLSearchParams({ a: '1', b: '2' }),
      })
    ).toBe('https://requete.com/api/v1/posts?a=1&b=2')
  })
})
