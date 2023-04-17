import { toAny } from 'test/utils'

import { HttpRequest } from '../HttpRequest'

describe('middleware specs', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(
      toAny(
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          statusText: 'ok',
          text: vi.fn().mockResolvedValue('null'),
          url: '/do-mock',
        })
      )
    )
  })

  it('should execute middleware in order according to the onion model with request context', async () => {
    const before = vi.fn()
    const after = vi.fn()

    const http = new HttpRequest()
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

    const res = await http.post('/do-mock')

    expect(res.request).toBeDefined()
    expect(res.data).toBeDefined()

    expect(before).nthCalledWith(1, res.request)
    expect(before).nthCalledWith(2, 2)
    expect(before).nthCalledWith(3, 3)

    expect(after).nthCalledWith(1, 3)
    expect(after).nthCalledWith(2, 2)
    expect(after).nthCalledWith(3, res.data)
  })

  it('should set request header correctly in middleware', async () => {
    const http = new HttpRequest()
    http.use(async (ctx, next) => {
      ctx.set('Authorization', 'mock')
      ctx.set({ 'x-client-by': 'mock' })
      ctx.set('x')
      await next()
    })

    const res = await http.post('/do-mock')
    expect(res.request.headers).toEqual(
      new Headers({
        Accept: 'application/json, text/plain, */*',
        Authorization: 'mock',
        'x-client-by': 'mock',
      })
    )
  })

  it('should set abortSignal correctly in middleware', async () => {
    const http = new HttpRequest()
    let controller: any
    http.use(async (ctx, next) => {
      controller = ctx.abort()
      await next()
    })

    const res = await http.post('/do-mock', undefined)
    expect(res.request.abort).toEqual(controller)
  })
})
