# requete

> `requete` is the French word for `request`

**requete** is a lightweight client-side (browsers) request library based on the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
It provides an API similar to [Axios](https://github.com/axios/axios). And supports middleware for processing requests and responses.

In addition, **requete** also includes an `XMLHttpRequest` adapter, which allows it to be used in older browsers that do not support Fetch, and provides polyfills to simplify import.

## Features

- Use `Fetch API` on modern browsers
- Use `XMLHttpRequest` on older browsers
- Supports `middleware` for handling request and response
- Supports the Promise API
- Transform request and response data
- Abort requests by [`TimeoutAbortController`](#timeoutabortcontroller)
- Automatic transforms for JSON response data, and supports custom transformer
- Automatic data object serialization to `multipart/form-data` and `x-www-form-urlencoded` body encodings

## Usage

To use `requete`, you can import it and create an instance using the `create` method:

```ts
import { create } from 'requete'

const requete = create()

// set some configs
const requete = create({ baseURL: 'https://your-api.com/api' })
```

or new `Requete` class:

```ts
import { Requete } from 'requete'

const requete = new Requete()
```

### Request Methods

The following aliases are provided for convenience:

```ts
requete.request<D = any>(config: IRequest)
requete.get<D = any>(url: string, config?: IRequest)
requete.delete<D = any>(url: string, config?: IRequest)
requete.head<D = any>(url: string, config?: IRequest)
requete.options<D = any>(url: string, config?: IRequest)
requete.post<D = any>(url: string, data?: RequestBody, config?: IRequest)
requete.put<D = any>(url: string, data?: RequestBody, config?: IRequest)
requete.patch<D = any>(url: string, data?: RequestBody, config?: IRequest)
```

Example:

```ts
import { create } from 'requete'

const requete = create({ baseURL: 'https://your-api.com/api' })

// Make a GET request for user profile with ID
requete
  .get<IUser>('/users/profile?id=123')
  .then((r) => r.data)
  .catch(console.error)
  .finally(() => {
    // always executed
  })

// or use `config.params` to set url search params
requete.get<IUser>('/users/profile', { params: { id: '123' } })
requete.get<IUser>('/users/profile', { params: 'id=123' })

// Make a POST request for update user profile
requete.post('/users/profile', { id: '123', name: 'Jay Chou' })
// or use `requete.request`
requete.request({
  url: '/users/profile',
  method: 'POST'
  data: { id: '123', name: 'Jay Chou' },
})
```

### Use Middleware

`requete.use` for add a middleware function to requete. It returns this, so is chainable.

- The calling order of middleware should follow the **Onion Model**.
  like [`Koa middleware`](https://github.com/koajs/koa/blob/master/docs/guide.md#writing-middleware).
- `next()` must be called asynchronously in middleware
- `ctx` is the requete context object, type `IContext`. more information in [here](#response-typings).

```ts
requete
  .use(async (ctx, next) => {
    const token = getToken()
    // throw a `RequestError` if unauthorize
    if (!token) ctx.throw('unauthorize')
    // set Authorization header
    else ctx.set('Authorization', token)

    try {
      // wait for request responding
      await next()
    } catch (e) {
      // when token expired, re-authenticate
      if (ctx.status === 401) {
        authenticate()
      }

      // continue to throws
      throw e
    }
  })
  .use((ctx, next) =>
    next().then(() => {
      // throw a `RequestError` in somehow
      if (!ctx.data.code === '<error_code>') {
        ctx.throw('Server Error')
      }
    })
  )
```

## Request Config

1. Config for create instance. (`create(config?: RequestConfig)`)

```ts
interface RequestConfig {
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
```

2. Config for request methods. (`requete.request(config?: IRequest)`)

```ts
interface IRequest extends RequestConfig {
  url: string
  /**
   * A string to set request's method.
   * @default GET
   */
  method?: Method
  /** A string or object to set querystring of url */
  params?: string | Record<string, any>
  /** request`s body */
  data?: RequestBody
  /**
   * A TimeoutAbortController to set request's signal.
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
```

## Response Typings

The response for a request is a context object, specifically of type `IContext`, which contains the following information.

```ts
interface IContext<Data = any> {
  /**
   * request config.
   * and empty `Headers` object as default
   */
  request: IRequest & { headers: Headers }
  headers: Headers
  ok: boolean
  redirected: boolean
  status: number
  statusText: string
  type: ResponseType
  url: string
  /** parsed response data */
  data: Data
  /** response text when responseType is `json` or `text` */
  responseText?: string

  /**
   * set request headers
   * *And header names are matched by case-insensitive byte sequence.*
   * @throws {RequestError}
   */
  set(headerOrName: HeadersInit | string, value?: string | null): this
  /**
   * throw RequestError
   */
  throw(e: string | Error): void
  /**
   * get `ctx.request.abort`,
   * and **create one if not exists**
   * @throws {RequestError}
   */
  abort(): TimeoutAbortController
}
```

In the middleware, `ctx`(IContext) is the first argument. Before sending the request (before `await next()`), you can use methods such as ctx.set, ctx.throw, ctx.abort. Otherwise, a `RequestError` will be thrown if these methods are called in other cases.

## RequestError

`RequestError` inherits from `Error`, contains the request context information, and provides the formatted output method (`print()`).

> All exceptions in the `requete` are `RequestError`.

```ts
class RequestError extends Error {
  name = 'RequestError'
  ctx: IContext

  constructor(errMsg: string | Error, ctx: IContext)

  print(): this
}
```

### Example

```ts
import { RequestError } from 'requete'

// if needed
throw new RequestError('<error message>', ctx)
throw new RequestError(new Error('<error message>', ctx))

// in requete middleware
ctx.throw('<error message>')

// promise.catch
requete.post('/api').catch((e) => {
  e.print() // formatted output
  console.log(e.status) // response status
  console.log(e.headers) // response header
})

// try-catch
try {
  await requete.post('/api')
} catch (e) {
  console.log(e.name) // "RequestError"
}
```

## TimeoutAbortController

`TimeoutAbortController` is used to auto-abort requests when timeout, and you can also call `abort()` to terminate them at any time. It is implemented based on [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).

In the requete configuration, you can add the `TimeoutAbortController` (or a regular `AbortController`) through the abort field.  
It should be noted that if you set the timeout in the FetchAdapter and did not pass in abort, requete will add the `TimeoutAbortController` by default to achieve timeout termination.

If the target browser does not support `AbortController`, please [add a polyfill](#polyfills) before using it.

```ts
class TimeoutAbortController {
  /** if not supported, it will throw error when `new` */
  static readonly supported: boolean

  /** timeout ms */
  constructor(timeout: number)

  get signal(): AbortSignal

  abort(reason?: any): void

  /** clear setTimeout */
  clear(): void
}
```

### Example

```ts
import { TimeoutAbortController } from 'requete'

// set 60s timeout
const controller = new TimeoutAbortController(60000)
requete.get('/download-large-thing', { abort: controller }).catch((e) => {
  e.print() // "canceled"
})
// you can abort request if needed
controller.abort('canceled')

// or timeout config
requete.get('/download-large-thing', { timeout: 60000 })
```

## Request Adapter

There are two request adapters in Requete: `FetchAdapter` and `XhrAdapter`.
If the current browser environment does not support the Fetch API, Xhr will be used instead.

Of course, you can also customize which adapter to use by declaring the adapter field in the request config.
For example, when obtaining download or upload progress events, you can choose to use the XhrAdapter.

Additionally, Requete also supports custom adapters by inheriting the `abstract class Adapter` and implementing the `request` method.

```ts
// typings
abstract class Adapter {
  static readonly supported: boolean
  abstract request<D>(ctx: IContext<D>): Promise<IResponse<D>>
}
```

### Example

```ts
// CustomAdapter.ts

import { Adapter } from 'requete'

export class CustomAdapter extends Adapter {
  static readonly supported = true

  async request(ctx: IContext) {
    // do request

    return response
  }
}
```

## Polyfills

If needed, you can directly import `requete/polyfill`. It includes polyfills for `Headers` and `AbortController`.

`requete/polyfill` will determine whether to add polyfills based on the user's browser.

- Headers`s by [headers-polyfill](https://github.com/mswjs/headers-polyfill)
- AbortController`s by [abortcontroller-polyfill](https://github.com/mo/abortcontroller-polyfill)

```ts
// in your entry file
import 'requete/polyfill'
```
