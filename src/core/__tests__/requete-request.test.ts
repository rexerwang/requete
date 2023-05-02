import { FetchAdapter } from 'requete/adapter'

import { Method, Requete } from '../Requete'

describe('Requete request configs', () => {
  beforeEach(() => {
    vi.spyOn(FetchAdapter.prototype, 'request').mockImplementation(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        url: '/do-mock',
        data: 'null',
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
    expect(ctx.request.url).toBe(
      'https://api.mock.com/api/v1/do-mock?id=1&id=2'
    )

    ctx = await requete.get('do-mock', { params: 'id=2' })
    expect(ctx.request.url).toBe('https://api.mock.com/api/v1/do-mock?id=2')
  })
})
