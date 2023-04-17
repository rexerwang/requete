import { toAny } from 'test/utils'

import type { Method } from '../../types'
import { Requete } from '../Requete'

describe('request config specs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const defaultHeaders = Requete.defaults.headers

  const spy = vi.spyOn(global, 'fetch').mockImplementation(
    toAny(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue('null'),
      })
    )
  )

  it('should make a request with correct url', () => {
    const http = new Requete({ baseURL: 'https://api.mock.com/api/v1/' })

    http.request({
      url: 'https://api.mock.com/api/v2/do-mock?id=1',
      method: 'POST',
    })
    expect(spy).toBeCalledWith('https://api.mock.com/api/v2/do-mock?id=1', {
      method: 'POST',
      body: undefined,
      headers: new Headers(defaultHeaders),
    })

    http.request({
      url: 'do-mock?id=1',
      params: { id: '2' },
      method: 'GET',
    })
    expect(spy).toBeCalledWith('https://api.mock.com/api/v1/do-mock?id=2', {
      method: 'GET',
      body: undefined,
      headers: new Headers(defaultHeaders),
    })

    http.request({
      url: 'do-mock?id=1',
      params: 'id=2',
      method: 'GET',
    })
    expect(spy).toBeCalledWith('https://api.mock.com/api/v1/do-mock?id=2', {
      method: 'GET',
      body: undefined,
      headers: new Headers(defaultHeaders),
    })
  })

  it.each([
    {
      payload: { a: 1 },
      contentType: 'application/json;charset=utf-8',
      expected: JSON.stringify({ a: 1 }),
    },
    {
      payload: 'a=1',
      contentType: 'application/x-www-form-urlencoded;charset=utf-8',
    },
    {
      payload: new URLSearchParams('a=1'),
      contentType: 'application/x-www-form-urlencoded;charset=utf-8',
    },
    {
      payload: null,
      contentType: 'application/x-www-form-urlencoded;charset=utf-8',
    },
    {
      payload: undefined,
      contentType: undefined,
    },
    {
      payload: new Blob(['a'], { type: 'text/plain' }),
      contentType: 'multipart/form-data;charset=utf-8',
    },
    {
      payload: new FormData(),
      contentType: 'multipart/form-data;charset=utf-8',
    },
  ])(
    'should set request body and Content-Type %#: $contentType',
    ({ payload, contentType, expected }) => {
      new Requete().post('/do-mock-payload', payload)

      const headers = new Headers(defaultHeaders)
      contentType && headers.set('Content-Type', contentType)

      expect(spy).toBeCalledWith('/do-mock-payload', {
        method: 'POST',
        body: expected ?? payload,
        headers,
      })
    }
  )

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
    (method) => {
      new Requete()[method]('/do-mock')

      expect(spy).toBeCalledWith('/do-mock', {
        method: method.toUpperCase(),
        body: undefined,
        headers: new Headers(defaultHeaders),
      })
    }
  )
})
