import { FetchAdapter } from '../../adapter'
import type { Method } from '../../types'
import { Requete } from '../Requete'

describe('request config specs', () => {
  beforeEach(() => {
    vi.spyOn(FetchAdapter.prototype, 'request').mockImplementation(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        url: '/do-mock',
        body: () => Promise.resolve('null'),
      })
    )
  })

  it.each([
    'get',
    'head',
    'delete',
    'options',
    'post',
    'patch',
    'put',
  ] as Lowercase<Method>[])(
    'should make request by %s alias func',
    async (method) => {
      const requete = new Requete()
      const ctx = await requete[method]('/do-mock')

      expect(ctx.request.url).toBe('/do-mock')
      expect(ctx.request.method).toBe(method.toUpperCase())
    }
  )

  it('should make a request with correct url', async () => {
    const requete = new Requete({ baseURL: 'https://api.mock.com/api/v1/' })

    let ctx = await requete.post('https://api.mock.com/api/v2/do-mock?id=1')
    expect(ctx.request.url).toBe('https://api.mock.com/api/v2/do-mock?id=1')

    ctx = await requete.get('do-mock?id=1', { params: { id: '2' } })
    expect(ctx.request.url).toBe('https://api.mock.com/api/v1/do-mock?id=2')

    ctx = await requete.get('do-mock?id=1', { params: 'id=2' })
    expect(ctx.request.url).toBe('https://api.mock.com/api/v1/do-mock?id=2')
  })

  // it.each([
  //   {
  //     payload: { a: 1 },
  //     contentType: 'application/json;charset=utf-8',
  //     expected: JSON.stringify({ a: 1 }),
  //   },
  //   {
  //     payload: 'a=1',
  //     contentType: 'application/x-www-form-urlencoded;charset=utf-8',
  //   },
  //   {
  //     payload: new URLSearchParams('a=1'),
  //     contentType: 'application/x-www-form-urlencoded;charset=utf-8',
  //   },
  //   {
  //     payload: null,
  //     contentType: 'application/x-www-form-urlencoded;charset=utf-8',
  //   },
  //   {
  //     payload: undefined,
  //     contentType: undefined,
  //   },
  //   {
  //     payload: new Blob(['a'], { type: 'text/plain' }),
  //     contentType: 'multipart/form-data;charset=utf-8',
  //   },
  //   {
  //     payload: new FormData(),
  //     contentType: 'multipart/form-data;charset=utf-8',
  //   },
  // ])(
  //   'should set request body and Content-Type %#: $contentType',
  //   async ({ payload, contentType, expected }) => {
  //     const headers = new Headers(Requete.defaults.headers)
  //     contentType && headers.set('Content-Type', contentType)

  //     const requete = new Requete()
  //     const { request } = await requete.post('/do-mock-payload', payload)

  //     expect(spy).toBeCalledWith('/do-mock-payload', {
  //       method: 'POST',
  //       body: expected ?? payload,
  //       headers,
  //     })
  //   }
  // )
})
