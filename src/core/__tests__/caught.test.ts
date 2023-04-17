import { toAny } from 'test/utils'

import { HttpRequest } from '../HttpRequest'
import { RequestError } from '../RequestError'

describe('caught specs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(
      toAny(
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          statusText: 'OK',
          text: vi.fn().mockResolvedValue('null'),
          url: '/do-mock',
        })
      )
    )

    // disable console.error
    vi.spyOn(global.console, 'error').mockImplementation(toAny(vi.fn()))
  })

  it('should caught RequestError when response`s status != 200', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(
      toAny(
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: vi.fn().mockResolvedValue('null'),
          url: '/do-mock',
        })
      )
    )

    const http = new HttpRequest()

    await expect(http.get('/do-mock')).rejects.toThrow(RequestError)
    await expect(http.get('/do-mock')).rejects.toThrow(
      'GET /do-mock 500 (Internal Server Error)'
    )
  })

  it('should caught RequestError when middleware throws', async () => {
    const http = new HttpRequest().use(async (ctx, next) => {
      if (ctx.request.method === 'GET') ctx.throw('not allowed')
      await next()
      if (ctx.request.method === 'POST') ctx.throw('post error')
    })

    await expect(http.get('/do-mock')).rejects.toThrow('not allowed')
    await expect(http.post('/do-mock')).rejects.toThrow('post error')
  })

  it('should caught when call ctx funcs in wrong way', async () => {
    // ctx.abort()
    await expect(
      new HttpRequest()
        .use(async (ctx, next) => {
          await next()
          ctx.abort()
        })
        .get('/do-mock')
    ).rejects.toThrow('Cannot set abortSignal after next().')

    // ctx.set()
    await expect(
      new HttpRequest()
        .use(async (ctx, next) => {
          await next()
          ctx.set('a', 'b')
        })
        .get('/do-mock')
    ).rejects.toThrow('Cannot set request headers after next().')
  })

  it('should caught when request aborted', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(
      toAny((url: any, req: any) => {
        if (req?.signal?.aborted) {
          throw new Error(req.signal.reason)
        }

        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: vi.fn().mockResolvedValue(undefined),
          url: '/do-mock',
        })
      })
    )

    const http = new HttpRequest().use(async (ctx, next) => {
      ctx.abort().abort('abort request')
      await next()
    })

    await expect(http.get('/do-mock')).rejects.toThrow('abort request')
  })

  it('should caught when wrong type request body', async () => {
    await expect(
      new HttpRequest().post('/do-mock', true as any)
    ).rejects.toThrow(/Invalid request body type/)
  })
})
