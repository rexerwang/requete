import { Method, TimeoutAbortController } from 'requete'
import { toAny } from 'test/utils'

import { FetchAdapter } from '../FetchAdapter'

describe('FetchAdapter specs', () => {
  const supported = FetchAdapter.supported

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    'GET',
    'HEAD',
    'DELETE',
    'OPTIONS',
    'POST',
    'PUT',
    'PATCH',
  ] as Method[])('should make a %s by fetch', (method) => {
    const spy = vi.spyOn(global, 'fetch').mockImplementation(toAny(vi.fn()))
    const headers = new Headers()

    new FetchAdapter()
      .request(
        toAny({
          request: { url: '/do-mock', method, headers },
        })
      )
      .catch(vi.fn())

    expect(spy).toBeCalledWith('/do-mock', {
      method,
      headers, // headers is required in ctx
    })
  })

  it('should set Content-Type header when given a POST request with payload', () => {
    const spy = vi.spyOn(global, 'fetch').mockImplementation(toAny(vi.fn()))
    const data = { a: 1 }

    new FetchAdapter()
      .request(
        toAny({
          request: {
            url: '/do-mock',
            method: 'POST',
            headers: new Headers(),
            data,
          },
        })
      )
      .catch(vi.fn())

    expect(spy).toBeCalledWith('/do-mock', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json;charset=utf-8',
      }),
      body: JSON.stringify(data),
    })
  })

  it('should remove Content-Type header when given a POST request without payload', () => {
    const spy = vi.spyOn(global, 'fetch').mockImplementation(toAny(vi.fn()))

    new FetchAdapter()
      .request(
        toAny({
          request: {
            url: '/do-mock',
            method: 'POST',
            headers: new Headers({
              'Content-Type': 'application/json',
            }),
          },
        })
      )
      .catch(vi.fn())

    expect(spy).toBeCalledWith('/do-mock', {
      method: 'POST',
      headers: new Headers(),
    })
  })

  it('should add abortSignal when given ctx with `abort` field', () => {
    const spy = vi.spyOn(global, 'fetch').mockImplementation(toAny(vi.fn()))

    const abort = new TimeoutAbortController(0)
    new FetchAdapter()
      .request(
        toAny({
          request: {
            url: '/do-mock',
            method: 'POST',
            headers: new Headers(),
            abort,
          },
        })
      )
      .catch(vi.fn())

    expect(spy).toBeCalledWith('/do-mock', {
      method: 'POST',
      headers: new Headers(),
      signal: abort.signal,
    })
  })

  it('should thrown ReferenceError when fetch api not supported', async () => {
    // @ts-ignore
    FetchAdapter.supported = false

    await expect(new FetchAdapter().request(toAny({}))).rejects.toThrow(
      ReferenceError
    )
    await expect(new FetchAdapter().request(toAny({}))).rejects.toThrow(
      'Not support fetch api in current environment.'
    )

    // @ts-ignore
    FetchAdapter.supported = supported
  })
})
