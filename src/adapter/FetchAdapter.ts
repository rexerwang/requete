import type { IContext, IRequest, IResponse } from 'requete'
import { pick, transformRequestBody } from 'requete/shared'

import { Adapter } from './Adapter'

export class FetchAdapter extends Adapter {
  static readonly supported = typeof fetch !== 'undefined'

  private transformRequest(request: IContext['request']) {
    const supports = [
      'method',
      'cache',
      'credentials',
      'headers',
      'integrity',
      'keepalive',
      'mode',
      'redirect',
      'referrer',
      'referrerPolicy',
    ]

    const init: RequestInit = supports.reduce((req, key) => {
      const value = request[key as keyof IRequest]
      if (value !== undefined) {
        req[key as keyof RequestInit] = value
      }
      return req
    }, {} as RequestInit)

    // Content-Type header
    const headers = init.headers as Headers
    if (/^(POST|PUT|PATCH)$/i.test(request.method!)) {
      const { requestBody, contentType } = transformRequestBody(request.data)
      init.body = requestBody
      if (contentType && !headers.has('Content-Type')) {
        headers.set('Content-Type', contentType)
      }
    }
    if (init.body == null) {
      headers.delete('Content-Type')
    }
    init.headers = headers

    if (request.abort) init.signal = request.abort.signal

    return init
  }

  async request(ctx: IContext) {
    if (!FetchAdapter.supported) {
      throw new ReferenceError('Not support fetch api in current environment.')
    }

    const response = await fetch(
      ctx.request.url,
      this.transformRequest(ctx.request)
    )

    const res = pick(response, [
      'ok',
      'status',
      'statusText',
      'headers',
      'redirected',
      'type',
      'url',
    ]) as IResponse

    switch (ctx.request.responseType) {
      case 'formData':
        res.data = await response.formData()
        break
      case 'blob':
        res.data = await response.blob()
        break
      case 'arrayBuffer':
        res.data = await response.arrayBuffer()
        break
      default:
        res.data = res.responseText = await response.text()
    }

    return res
  }
}
