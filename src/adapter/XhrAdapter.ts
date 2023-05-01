import { IContext, IResponse } from 'requete'
import {
  parseHeaders,
  progressEventReducer,
  RequestError,
  transformRequestBody,
} from 'requete/shared'

import { Adapter } from './Adapter'

export interface IProgressEvent {
  loaded: number
  total?: number
  progress?: number
  bytes: number
  rate?: number
  estimated?: number
  upload?: boolean
  download?: boolean
  event?: any
}

export type XhrAdapterOptions = {
  onDownloadProgress?(e: IProgressEvent): void
  onUploadProgress?(e: IProgressEvent): void
}

export class XhrAdapter extends Adapter {
  static readonly supported = typeof XMLHttpRequest !== 'undefined'

  constructor(private options?: XhrAdapterOptions) {
    super()
  }

  private transformRequest(xhr: XMLHttpRequest, ctx: IContext) {
    const { request } = ctx
    const { headers } = request

    if (request.timeout) {
      xhr.timeout = request.timeout
    }

    // Add withCredentials to xhr
    if (request.credentials === 'include') {
      xhr.withCredentials = true
    }

    // Content-Type header to xhr
    let requestBody: any
    if (/^(POST|PUT|PATCH)$/i.test(request.method!)) {
      const body = transformRequestBody(request.data)
      requestBody = body.requestBody

      if (body.contentType && !request.headers.has('Content-Type')) {
        headers.set('Content-Type', body.contentType)
      }
    }
    if (requestBody == null) {
      headers.delete('Content-Type')
    }

    // Add headers to xhr
    headers.forEach((value, key) => {
      xhr.setRequestHeader(key, value)
    })

    return requestBody
  }

  private transformResponse(xhr: XMLHttpRequest, ctx: IContext) {
    const response: IResponse = {
      ok: !!xhr.status && xhr.status >= 200 && xhr.status < 300,
      status: xhr.status,
      statusText: xhr.statusText,
      headers: parseHeaders(xhr.getAllResponseHeaders()),
      redirected: false,
      type: 'default',
      url: xhr.responseURL,
      data: ['json', 'text', undefined].includes(ctx.request.responseType)
        ? xhr.responseText
        : xhr.response,
      responseText: xhr.responseText,
    }

    return response
  }

  request(ctx: IContext) {
    return new Promise<IResponse>((resolve, reject) => {
      if (!XhrAdapter.supported) {
        throw new ReferenceError(
          'Not support XMLHttpRequest api in current environment.'
        )
      }

      let xhr: null | XMLHttpRequest = new XMLHttpRequest()
      xhr.open(ctx.request.method!, ctx.request.url, true)

      const abort = (abortReq?: boolean) => {
        reject(
          new RequestError(ctx.request.abort!.signal.reason ?? 'aborted', ctx)
        )

        abortReq && xhr!.abort()
        xhr = null
      }

      const onabort = () => {
        if (!xhr) return
        abort(true)
      }

      // add abortSignal
      if (ctx.request.abort) {
        const { signal } = ctx.request.abort
        if (signal.aborted) {
          // no need to send request
          return abort()
        }

        signal.addEventListener('abort', onabort)
      }

      xhr.onloadend = () => {
        if (!xhr) return

        resolve(this.transformResponse(xhr, ctx))

        ctx.request.abort?.signal.removeEventListener('abort', onabort)
        xhr = null
      }

      xhr.onerror = () => {
        if (!xhr) return
        reject(new RequestError('Network Error', ctx))
        xhr = null
      }

      xhr.ontimeout = () => {
        if (!xhr) return
        reject(new RequestError('timeout', ctx))
        xhr = null
      }

      if (this.options?.onDownloadProgress) {
        xhr.addEventListener(
          'progress',
          progressEventReducer(this.options.onDownloadProgress, true)
        )
      }

      // Not all browsers support upload events
      if (this.options?.onUploadProgress && xhr.upload) {
        xhr.addEventListener(
          'progress',
          progressEventReducer(this.options.onUploadProgress)
        )
      }

      xhr.send(this.transformRequest(xhr, ctx) ?? null)
    })
  }
}
