import { Adapter, createAdapter } from '../adapter'
import { getUri, mergeHeaders, pick } from '../helpers'
import type {
  IContext,
  IRequest,
  RequestBody,
  RequestConfig,
  RequestMiddleware,
} from '../types'
import { TimeoutAbortController } from './AbortController'
import { compose } from './compose'
import { RequestError } from './RequestError'

type AliasConfig = Omit<IRequest, 'url' | 'data'>

export class Requete {
  static defaults: RequestConfig = {
    timeout: 0,
    responseType: 'json',
    headers: {
      Accept: 'application/json, text/plain, */*',
    },
    toJSON: JSON.parse,
  }

  private configs?: RequestConfig
  private adapter: Adapter
  private middlewares: RequestMiddleware[] = []

  constructor(config?: RequestConfig) {
    this.configs = Object.assign({ method: 'GET' }, Requete.defaults, config)
    this.adapter = createAdapter()
  }

  /**
   * add middleware function
   *
   * @attention
   * - The calling order of middleware should follow the **Onion Model**.
   *   like {@link https://github.com/koajs/koa/blob/master/docs/guide.md#writing-middleware Koajs}.
   * - `next()` must be called asynchronously in middleware
   *
   * @example
   * ```ts
   * http.use(async (ctx, next) => {
   *   // set request header
   *   ctx.set('Authorization', '<token>')
   *
   *   // wait for request responding
   *   await next()
   *
   *   // response body
   *   console.log(ctx.data)
   *   // response
   *   console.log(ctx.response)
   *
   *   // throw a request error
   *   if (!ctx.data) ctx.throw('no response data')
   * })
   *
   * ```
   */
  use(middleware: RequestMiddleware) {
    this.middlewares.push(middleware)
    return this
  }

  private createRequest(config: IRequest) {
    const request: IRequest = Object.assign({}, this.configs, config)

    request.url = getUri(request)
    request.headers = mergeHeaders(
      Requete.defaults.headers,
      this.configs?.headers,
      config.headers
    )

    // add default AbortController for timeout
    if (!request.abort && request.timeout && TimeoutAbortController.supported) {
      request.abort = new TimeoutAbortController(request.timeout)
    }

    return request as IContext['request']
  }

  private createContext<D>(config: IRequest) {
    const request = this.createRequest(config)
    const ctx: IContext<D> = {
      request,
      status: -1,
      data: undefined as D,
      body: () => Promise.reject(),
      ok: false,
      redirected: false,
      headers: undefined as unknown as Headers,
      statusText: undefined as unknown as string,
      type: undefined as unknown as ResponseType,
      url: request.url,
      set(headerOrName, value) {
        if (this.status !== -1)
          this.throw('Cannot set request headers after next().')

        let headers = this.request.headers

        if (typeof headerOrName === 'string') {
          value == null
            ? headers.delete(headerOrName)
            : headers.set(headerOrName, value)
        } else {
          headers = mergeHeaders(headers, headerOrName)
        }

        this.request.headers = headers

        return this
      },
      throw(e) {
        throw new RequestError(e, this)
      },
      abort() {
        if (!this.request.abort) {
          if (this.status !== -1)
            this.throw('Cannot set abortSignal after next().')

          const abort = new TimeoutAbortController(this.request.timeout ?? 0)
          this.request.abort = abort
        }

        return this.request.abort
      },
    }

    return ctx
  }

  private async invoke(ctx: IContext) {
    const adapter = ctx.request.adapter ?? this.adapter
    const response = await adapter.request(ctx)

    // assign to ctx
    Object.assign(
      ctx,
      pick(response, [
        'ok',
        'status',
        'statusText',
        'headers',
        'data',
        'body',
        'redirected',
        'type',
        'url',
      ])
    )

    const data = await response.body()
    switch (ctx.request.responseType) {
      case 'json':
        ctx.data = ctx.request.toJSON?.(data)
        ctx.responseText = data
        break
      case 'text':
        ctx.data = ctx.responseText = data
        break
      default:
        ctx.data = data
        break
    }

    if (!ctx.ok) {
      throw new RequestError(
        `${ctx.request.method} ${ctx.url} ${ctx.status} (${ctx.statusText})`,
        ctx
      )
    }
  }

  async request<D = any>(config: IRequest) {
    // create context
    const context = this.createContext<D>(config)

    // exec middleware
    try {
      await compose(this.middlewares)(context, this.invoke.bind(this))
      return context
    } catch (e: any) {
      throw (
        e.name === 'RequestError' ? e : new RequestError(e, context)
      ).print()
    } finally {
      context.request.abort?.clear()
    }
  }

  get<D = any>(url: string, config?: AliasConfig) {
    return this.request<D>({ ...config, url, method: 'GET' })
  }
  delete<D = any>(url: string, config?: AliasConfig) {
    return this.request<D>({ ...config, url, method: 'DELETE' })
  }
  head<D = any>(url: string, config?: AliasConfig) {
    return this.request<D>({ ...config, url, method: 'HEAD' })
  }
  options<D = any>(url: string, config?: AliasConfig) {
    return this.request<D>({ ...config, url, method: 'OPTIONS' })
  }
  post<D = any>(url: string, data?: RequestBody, config?: AliasConfig) {
    return this.request<D>({ ...config, url, data, method: 'POST' })
  }
  put<D = any>(url: string, data?: RequestBody, config?: AliasConfig) {
    return this.request<D>({ ...config, url, data, method: 'PUT' })
  }
  patch<D = any>(url: string, data?: RequestBody, config?: AliasConfig) {
    return this.request<D>({ ...config, url, data, method: 'PATCH' })
  }
}
