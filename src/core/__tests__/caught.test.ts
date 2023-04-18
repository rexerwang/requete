import { toAny } from 'test/utils'

import { FetchAdapter } from '../../adapter'
import { RequestError } from '../RequestError'
import { Requete } from '../Requete'

describe('caught specs', () => {
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

    // disable console.error
    vi.spyOn(global.console, 'error').mockImplementation(toAny(vi.fn()))
  })

  it('should caught RequestError when response`s status != 200', async () => {
    vi.spyOn(FetchAdapter.prototype, 'request').mockImplementation(
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        url: '/do-mock',
        body: () => Promise.resolve('null'),
      })
    )

    const requete = new Requete()

    await expect(requete.get('https:api.com/do-mock')).rejects.toThrow(
      RequestError
    )
    await expect(requete.get('/do-mock')).rejects.toThrow(
      'GET /do-mock 500 (Internal Server Error)'
    )
  })

  it('should caught RequestError when middleware throws', async () => {
    const requete = new Requete().use(async (ctx, next) => {
      if (ctx.request.method === 'GET') ctx.throw('not allowed')
      await next()
      if (ctx.request.method === 'POST') ctx.throw('post error')
    })

    await expect(requete.get('/do-mock')).rejects.toThrow('not allowed')
    await expect(requete.post('/do-mock')).rejects.toThrow('post error')
  })

  it('should caught when call ctx funcs in wrong way', async () => {
    // ctx.abort()
    await expect(
      new Requete()
        .use(async (ctx, next) => {
          await next()
          ctx.abort()
        })
        .get('/do-mock')
    ).rejects.toThrow('Cannot set abortSignal after next().')

    // ctx.set()
    await expect(
      new Requete()
        .use(async (ctx, next) => {
          await next()
          ctx.set('a', 'b')
        })
        .get('/do-mock')
    ).rejects.toThrow('Cannot set request headers after next().')
  })

  it('should caught when request aborted', async () => {
    vi.spyOn(FetchAdapter.prototype, 'request').mockImplementation(
      async (ctx) => {
        const abort = ctx.abort()
        if (abort.signal.aborted) {
          throw new Error(abort.signal.reason)
        }

        return toAny({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          url: '/do-mock',
          body: () => Promise.resolve('null'),
        })
      }
    )

    const requete = new Requete().use(async (ctx, next) => {
      ctx.abort().abort('abort request')
      await next()
    })

    await expect(requete.get('/do-mock')).rejects.toThrow('abort request')
  })
})
