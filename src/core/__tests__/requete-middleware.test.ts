import { FetchAdapter } from 'requete/adapter'
import { toAny } from 'test/utils'

import { Requete } from '../Requete'

describe('Requete middleware specs', () => {
  const spy = vi.spyOn(FetchAdapter.prototype, 'request').mockImplementation(
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      url: '/do-mock',
      data: 'null',
    })
  )

  beforeEach(() => {
    spy.mockClear()
  })

  it('should execute middleware in order according to the onion model with request context', async () => {
    const before = vi.fn()
    const after = vi.fn()

    const requete = new Requete()
      .use(async (ctx, next) => {
        before(ctx.request)
        await next()
        after(ctx.data)
      })
      .use(async (ctx, next) => {
        before(2)
        await next()
        after(2)
      })
      .use(async (ctx, next) => {
        before(3)
        await next()
        after(3)
      })

    const res = await requete.post('/do-mock')

    expect(res.request).toBeDefined()
    expect(res.data).toBeDefined()

    expect(before).nthCalledWith(1, res.request)
    expect(before).nthCalledWith(2, 2)
    expect(before).nthCalledWith(3, 3)

    expect(after).nthCalledWith(1, 3)
    expect(after).nthCalledWith(2, 2)
    expect(after).nthCalledWith(3, res.data)
  })

  it('should throws when call next() duplicated', async () => {
    vi.spyOn(console, 'error').mockImplementation(toAny(vi.fn()))

    const requete = new Requete()
    requete.use(async (ctx, next) => {
      await next()
      await next()
    })

    await expect(requete.post('/do-mock')).rejects.toThrow(
      'next() called multiple times'
    )
  })

  it('should set request header correctly in middleware', async () => {
    const requete = new Requete()
    requete.use(async (ctx, next) => {
      ctx.set('Authorization', 'mock')
      ctx.set({ 'x-client-by': 'mock' })
      ctx.set('x')
      await next()
    })

    const res = await requete.post('/do-mock')
    expect(res.request.headers).toEqual(
      new Headers({
        Accept: 'application/json, text/plain, */*',
        Authorization: 'mock',
        'x-client-by': 'mock',
      })
    )
  })

  it('should set params correctly in middleware', async () => {
    const requete = new Requete()
    requete.use(async (ctx, next) => {
      ctx.params({ a: 1, b: 2 })
      await next()
    })

    const res = await requete.post('/do-mock', { params: { b: 1 } })
    expect(res.request.url).toBe('/do-mock?a=1&b=2')
  })

  it('should set abortSignal correctly in middleware', async () => {
    const requete = new Requete()
    let controller: any
    requete.use(async (ctx, next) => {
      controller = ctx.abort()
      await next()
    })

    const res = await requete.post('/do-mock', undefined)
    expect(res.request.abort).toEqual(controller)
  })

  it('should replay the request in middleware', async () => {
    const requete = new Requete()

    requete.use(async (ctx, next) => {
      await next()

      if (!ctx.request.custom?.replay) {
        await ctx.replay()
      }
    })

    const { request } = await requete.post('/do-mock')
    expect(spy).toBeCalledTimes(2)
    expect(request.custom?.replay).toBe(1)
  })
})
