import { Adapter, createAdapter } from '../adapter'
import { getUri, mergeHeaders, pick } from '../helpers'
import { TimeoutAbortController } from './AbortController'
import { compose } from './compose'
import { RequestError } from './RequestError'

export type Method =
  | 'GET'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'POST'
  | 'PUT'
  | 'PATCH'

export type RequestBody =
  | BodyInit
  | null
  | Record<string, any>
  | Record<string, any>[]

export interface RequestConfig {
  baseURL?: string
  /** request timeout (ms) */
  timeout?: number
  /** response body type */
  responseType?: 'json' | 'formData' | 'text' | 'blob' | 'arrayBuffer'
  /** A string indicating how the request will interact with the browser's cache to set request's cache. */
  cache?: RequestCache
  /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
  credentials?: RequestCredentials
  /** A Headers object, an object literal, or an array of two-item arrays to set request's headers. */
  headers?: HeadersInit
  /** A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */
  integrity?: string
  /** A boolean to set request's keepalive. */
  keepalive?: boolean
  /** A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode. */
  mode?: RequestMode
  /** A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect. */
  redirect?: RequestRedirect
  /** A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer. */
  referrer?: string
  /** A referrer policy to set request's referrerPolicy. */
  referrerPolicy?: ReferrerPolicy
  /**
   * parse json function
   * (for transform response)
   * @default JSON.parse
   */
  toJSON?(body: string): any
}

export interface IRequest extends RequestConfig {
  url: string
  /**
   * A string to set request's method.
   * @default GET
   */
  method?: Method
  /** A string or object to set querystring of url */
  params?: string | Record<string, string | number | boolean>
  /** request`s body */
  data?: RequestBody
  /**
   * A TimeoutAbortController to set request's signal.
   * @default TimeoutAbortController
   */
  abort?: TimeoutAbortController | null
  /** specify request adapter */
  adapter?: Adapter
  /** flexible custom field */
  custom?: any
}

/** {@link https://developer.mozilla.org/en-US/docs/Web/API/Response} */
export interface IResponse<Data = any> {
  headers: Headers
  ok: boolean
  redirected: boolean
  status: number
  statusText: string
  type: ResponseType
  url: string
  data: Data
  responseText?: string
}

export interface IContext<Data = any> extends IResponse<Data> {
  /**
   * request config.
   * and empty `Headers` object as default
   */
  request: IRequest & { headers: Headers }
  /**
   * set `ctx.request.headers`
   *
   * *And header names are matched by case-insensitive byte sequence.*
   *
   * @example
   * ```ts
   * // set a header
   * ctx.set('name', '<value>')
   *
   * // remove a header
   * ctx.set('name', null)
   * ctx.set('name')
   *
   * // set headers
   * ctx.set({ name1: '<value>', name2: '<value>' })
   * ```
   */
  set(headerOrName: HeadersInit | string, value?: string | null): this
  /** throw {@link RequestError} */
  throw(e: string | Error): void
  /**
   * get `ctx.request.abort`,
   * and **create one if not exist**
   * @throws {RequestError}
   */
  abort(): TimeoutAbortController
}

export type Middleware = (
  ctx: IContext,
  next: () => Promise<void>
) => Promise<void>

type AliasConfig = Omit<IRequest, 'url' | 'data'>

export class Requete {
  static defaults: RequestConfig = {
    timeout: 0,
    responseType: 'json',
    headers: {
      Accept: 'application/json, text/plain, */*',
    },
    toJSON: (text: string | null | undefined) => {
      if (text) return JSON.parse(text)
    },
  }

  private configs?: RequestConfig
  private adapter: Adapter
  private middlewares: Middleware[] = []

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
   *   // transformed response body
   *   console.log(ctx.data)
   *
   *   // throw a request error
   *   if (!ctx.data) ctx.throw('no response data')
   * })
   * ```
   */
  use(middleware: Middleware) {
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
        if (e instanceof RequestError) throw e
        throw new RequestError(e, this)
      },
      abort() {
        if (!this.request.abort) {
          if (this.status !== -1)
            this.throw('Cannot set abortSignal after next().')

          this.request.abort = new TimeoutAbortController(
            this.request.timeout ?? 0
          )
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
        'responseText',
        'redirected',
        'type',
        'url',
      ])
    )

    if (ctx.request.responseType === 'json') {
      ctx.data = ctx.request.toJSON!(response.data)
    }

    if (!ctx.ok) {
      ctx.throw(
        `${ctx.request.method} ${ctx.url} ${ctx.status} (${ctx.statusText})`
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
