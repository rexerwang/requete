import type { IContext, IRequest, IResponse } from '../core/Requete'
import { pick, transformRequestBody } from '../helpers'
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

    res.body = async () => {
      switch (ctx.request.responseType) {
        case 'formData':
          return await response.formData()
        case 'blob':
          return await response.blob()
        case 'arrayBuffer':
          return await response.arrayBuffer()
        default:
          return await response.text()
      }
    }

    return res
  }
}
