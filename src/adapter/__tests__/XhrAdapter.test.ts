import { Method, TimeoutAbortController } from 'requete'
import { sleep, toAny } from 'test/utils'

import * as progress from '../../shared/progress'
import { XhrAdapter } from '../XhrAdapter'

describe('XhrAdapter specs', () => {
  const supported = XhrAdapter.supported

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should thrown ReferenceError when fetch api not supported', async () => {
    // @ts-ignore
    XhrAdapter.supported = false

    await expect(new XhrAdapter().request(toAny({}))).rejects.toThrow(
      ReferenceError
    )
    await expect(new XhrAdapter().request(toAny({}))).rejects.toThrow(
      'Not support XMLHttpRequest api in current environment.'
    )

    // @ts-ignore
    XhrAdapter.supported = supported
  })

  describe('XhrAdapter: request config specs', () => {
    it.each([
      'GET',
      'HEAD',
      'DELETE',
      'OPTIONS',
      'POST',
      'PUT',
      'PATCH',
    ] as Method[])('should make a %s by XMLHttpRequest', (method) => {
      const openStub = vi.fn()

      vi.spyOn(global, 'XMLHttpRequest').mockImplementation(
        toAny(
          vi.fn().mockReturnValue({
            open: openStub,
          })
        )
      )

      expect(XhrAdapter.supported).toBe(true)

      new XhrAdapter()
        .request(
          toAny({
            request: { url: '/do-mock', method },
          })
        )
        .catch(vi.fn())

      expect(openStub).toBeCalledWith(method, '/do-mock', true)
    })

    it('should set Content-Type header when given a POST request with payload', () => {
      const setRequestHeaderStub = vi.fn()
      const sendStub = vi.fn()

      vi.spyOn(global, 'XMLHttpRequest').mockImplementation(
        toAny(
          vi.fn().mockReturnValue({
            open: vi.fn(),
            setRequestHeader: setRequestHeaderStub,
            send: sendStub,
          })
        )
      )

      const data = { a: 1 }

      new XhrAdapter().request(
        toAny({
          request: {
            url: '/do-mock',
            method: 'POST',
            headers: new Headers(),
            data,
          },
        })
      )

      expect(setRequestHeaderStub).toBeCalledWith(
        'content-type', // lower-case by `Headers`
        'application/json;charset=utf-8'
      )
      expect(sendStub).toBeCalledWith(JSON.stringify(data))
    })

    it('should remove Content-Type header when given a POST request without payload', () => {
      const setRequestHeaderStub = vi.fn()
      const sendStub = vi.fn()

      vi.spyOn(global, 'XMLHttpRequest').mockImplementation(
        toAny(
          vi.fn().mockReturnValue({
            open: vi.fn(),
            setRequestHeader: setRequestHeaderStub,
            send: sendStub,
          })
        )
      )

      new XhrAdapter().request(
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

      expect(setRequestHeaderStub).not.toBeCalled()
      expect(sendStub).toBeCalledWith(null)
    })

    it('should set timeout to xhr when given timeout in ctx', () => {
      const setterStub = vi.fn()
      vi.spyOn(global, 'XMLHttpRequest').mockImplementation(
        toAny(
          vi.fn().mockReturnValue({
            open: vi.fn(),
            send: vi.fn(),
            set timeout(v: any) {
              setterStub(v)
            },
          })
        )
      )

      new XhrAdapter().request(
        toAny({
          request: {
            url: '/do-mock',
            method: 'POST',
            headers: new Headers(),
            timeout: 1,
          },
        })
      )

      expect(setterStub).toBeCalledWith(1)
    })

    it('should set withCredentials to xhr when given credentials == `include` in ctx', () => {
      const setterStub = vi.fn()
      vi.spyOn(global, 'XMLHttpRequest').mockImplementation(
        toAny(
          vi.fn().mockReturnValue({
            open: vi.fn(),
            send: vi.fn(),
            set withCredentials(v: any) {
              setterStub(v)
            },
          })
        )
      )

      new XhrAdapter().request(
        toAny({
          request: {
            url: '/do-mock',
            method: 'POST',
            headers: new Headers(),
            credentials: 'include',
          },
        })
      )

      expect(setterStub).toBeCalledWith(true)
    })
  })

  describe('XhrAdapter: response specs', () => {
    it('should transform response for ctx when the request is onloadend', async () => {
      vi.spyOn(global, 'XMLHttpRequest').mockImplementation(() => {
        class FakeXhr {
          onloadend = vi.fn()
          open = vi.fn()
          send() {
            this.onloadend()
          }
          getAllResponseHeaders = () => undefined
        }

        return new FakeXhr() as any
      })

      const response = await new XhrAdapter().request(
        toAny({
          request: {
            url: '/do-mock',
            method: 'POST',
            headers: new Headers(),
            abort: new TimeoutAbortController(0),
          },
        })
      )

      expect(response).toEqual({
        ok: false,
        status: undefined,
        statusText: undefined,
        headers: new Headers(),
        redirected: false,
        type: 'default',
        url: undefined,
        data: undefined,
      })
    })

    it.each([
      { status: 200, expected: true },
      { status: 201, expected: true },
      { status: 301, expected: false },
      { status: 404, expected: false },
      { status: 500, expected: false },
    ])(
      'should set response.ok is $expected when response status is $status',
      async ({ status, expected }) => {
        vi.spyOn(global, 'XMLHttpRequest').mockImplementation(() => {
          class FakeXhr {
            status = status
            onloadend = vi.fn()
            open = vi.fn()
            send() {
              this.onloadend()
            }
            getAllResponseHeaders = () => undefined
          }

          return new FakeXhr() as any
        })

        const { ok } = await new XhrAdapter().request(
          toAny({
            request: {
              url: '/do-mock',
              method: 'POST',
              headers: new Headers(),
            },
          })
        )

        expect(ok).toBe(expected)
      }
    )

    it.each([
      { responseType: 'blob', resIndex: 1 },
      { responseType: 'arrayBuffer', resIndex: 1 },
      { responseType: 'formData', resIndex: 1 },
      { responseType: 'json', resIndex: 0 },
      { responseType: 'text', resIndex: 0 },
    ])(
      'should get response data after loadend when given then responseType is $responseType',
      async ({ responseType, resIndex }) => {
        const mockRes = ['mock responseText', 'mock response']

        vi.spyOn(global, 'XMLHttpRequest').mockImplementation(() => {
          class FakeXhr {
            responseText = mockRes[0]
            response = mockRes[1]

            onloadend = vi.fn()
            open = vi.fn()
            send() {
              this.onloadend()
            }
            getAllResponseHeaders = () => undefined
          }

          return new FakeXhr() as any
        })

        const { data } = await new XhrAdapter().request(
          toAny({
            request: {
              url: '/do-mock',
              method: 'POST',
              headers: new Headers(),
              responseType,
            },
          })
        )

        expect(data).toBe(mockRes[resIndex])
      }
    )
  })

  describe('XhrAdapter: exception specs', () => {
    it('should thrown a error when request onerror', async () => {
      vi.spyOn(global, 'XMLHttpRequest').mockImplementation(() => {
        class FakeXhr {
          onerror = vi.fn()
          open = vi.fn()
          send() {
            this.onerror()
          }
          getAllResponseHeaders = () => undefined
        }

        return new FakeXhr() as any
      })

      await expect(
        new XhrAdapter().request(toAny({ request: { headers: new Headers() } }))
      ).rejects.toThrow('Network Error')
    })

    it('should thrown a error when request ontimeout', async () => {
      vi.spyOn(global, 'XMLHttpRequest').mockImplementation(() => {
        class FakeXhr {
          ontimeout = vi.fn()
          open = vi.fn()
          send() {
            this.ontimeout()
          }
          getAllResponseHeaders = () => undefined
        }

        return new FakeXhr() as any
      })

      await expect(
        new XhrAdapter().request(toAny({ request: { headers: new Headers() } }))
      ).rejects.toThrow('timeout')
    })
  })

  describe('XhrAdapter: abort specs', () => {
    it('should thrown error & don`t send request when given a aborted AbortController in ctx', async () => {
      const sendStub = vi.fn()

      vi.spyOn(global, 'XMLHttpRequest').mockImplementation(() => {
        class FakeXhr {
          open = vi.fn()
          send = sendStub
          getAllResponseHeaders = () => undefined
        }

        return new FakeXhr() as any
      })

      const adapter = new XhrAdapter()

      let controller = new TimeoutAbortController(0)
      controller.abort()

      await expect(
        adapter.request(
          toAny({ request: { headers: new Headers(), abort: controller } })
        )
      ).rejects.toThrow('aborted')

      expect(sendStub).not.toBeCalled()

      controller = new TimeoutAbortController(0)
      controller.abort('canceled')

      await expect(
        adapter.request(
          toAny({ request: { headers: new Headers(), abort: controller } })
        )
      ).rejects.toThrow('canceled')
    })

    it('should abort the pending request by AbortController', async () => {
      const abortStub = vi.fn()
      const onloadendStub = vi.fn()

      vi.spyOn(global, 'XMLHttpRequest').mockImplementation(() => {
        class FakeXhr {
          open = vi.fn()
          getAllResponseHeaders = () => undefined
          onloadend = vi.fn()
          send = () => sleep(1000).then(() => this.onloadend)
          abort = abortStub
        }

        return new FakeXhr() as any
      })

      const adapter = new XhrAdapter()
      const controller = new TimeoutAbortController(0)
      const request = adapter.request(
        toAny({ request: { headers: new Headers(), abort: controller } })
      )

      controller.abort('why abort?')

      await expect(request).rejects.toThrow('why abort?')
      expect(abortStub).toBeCalled()
      expect(onloadendStub).not.toBeCalled()
    })
  })

  describe('XhrAdapter: with progress options', () => {
    it('should not set `onDownloadProgress` to xhr when given the option', () => {
      const handleStub = vi.fn()
      const spy = vi
        .spyOn(progress, 'progressEventReducer')
        .mockImplementation(toAny(vi.fn().mockReturnValue(handleStub)))

      const addEventListenerStub = vi.fn()
      vi.spyOn(global, 'XMLHttpRequest').mockImplementation(() => {
        class FakeXhr {
          open = vi.fn()
          send = vi.fn()
          addEventListener = addEventListenerStub
        }

        return new FakeXhr() as any
      })

      const onDownloadProgress = vi.fn()
      new XhrAdapter({ onDownloadProgress }).request(
        toAny({ request: { headers: new Headers() } })
      )

      expect(spy).toBeCalledWith(onDownloadProgress, true)
      expect(addEventListenerStub).toBeCalledWith('progress', handleStub)
    })

    it('should set `onUploadProgress` to xhr when given the option & it support upload', () => {
      const handleStub = vi.fn()
      const spy = vi
        .spyOn(progress, 'progressEventReducer')
        .mockImplementation(toAny(vi.fn().mockReturnValue(handleStub)))

      const addEventListenerStub = vi.fn()
      vi.spyOn(global, 'XMLHttpRequest').mockImplementation(() => {
        class FakeXhr {
          open = vi.fn()
          send = vi.fn()
          addEventListener = addEventListenerStub
          upload = true
        }

        return new FakeXhr() as any
      })

      const onUploadProgress = vi.fn()
      new XhrAdapter({ onUploadProgress }).request(
        toAny({ request: { headers: new Headers() } })
      )

      expect(spy).toBeCalledWith(onUploadProgress)
      expect(addEventListenerStub).toBeCalledWith('progress', handleStub)
    })

    it('should not set `onUploadProgress` to xhr when it not support upload', () => {
      const spy = vi
        .spyOn(progress, 'progressEventReducer')
        .mockImplementation(toAny(vi.fn()))

      const addEventListenerStub = vi.fn()
      vi.spyOn(global, 'XMLHttpRequest').mockImplementation(() => {
        class FakeXhr {
          open = vi.fn()
          send = vi.fn()
          addEventListener = addEventListenerStub
        }

        return new FakeXhr() as any
      })

      new XhrAdapter({ onUploadProgress: vi.fn() }).request(
        toAny({ request: { headers: new Headers() } })
      )

      expect(spy).not.toBeCalled()
      expect(addEventListenerStub).not.toBeCalled()
    })
  })
})
