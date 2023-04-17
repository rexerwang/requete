import type { Adapter } from './adapter'
import type { TimeoutAbortController } from './core/AbortController'

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

export interface IXhrProgressEvent {
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
  /** An string or object to set querystring of url */
  params?: string | Record<string, any>
  /** request`s body */
  data?: RequestBody
  /**
   * An TimeoutAbortController to set request's signal.
   * @default TimeoutAbortController
   */
  abort?: TimeoutAbortController | null
  /** specify request adapter */
  adapter?: Adapter
  /** **(XhrAdapter Only)** download progress event */
  onDownloadProgress?(e: IXhrProgressEvent): void
  /** **(XhrAdapter Only)** upload progress event */
  onUploadProgress?(e: IXhrProgressEvent): void
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
  /** response body parser. **For Internal Only** */
  body(): Promise<Data>
  /** response text when responseType is `json` or `text` */
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

export type Middleware<T> = (ctx: T, next: () => Promise<void>) => Promise<void>
export type RequestMiddleware = Middleware<IContext>
