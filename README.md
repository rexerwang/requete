# requete

> `requete` is the French word for `request`

[![npm version](https://img.shields.io/npm/v/requete.svg?style=flat)](https://npm.im/requete)
[![install size](https://packagephobia.com/badge?p=requete)](https://packagephobia.com/result?p=requete)
[![npm bundle size](https://img.shields.io/bundlephobia/min/requete?style=flat)](https://bundlephobia.com/package/requete)
[![build status](https://github.com/rexerwang/requete/actions/workflows/ci.yml/badge.svg)](https://github.com/rexerwang/requete/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/rexerwang/requete/branch/main/graph/badge.svg?token=IL9AYNO98T)](https://codecov.io/gh/rexerwang/requete)

**requete** is a lightweight client-side HTTP request library based on the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), and supports middleware for processing requests and responses.
It provides APIs similar to `Axios`.

In addition, **requete** also includes an `XMLHttpRequest` adapter, which allows it to be used in older browsers that do not support `Fetch`, and provides polyfills to simplify import.

Also, `requete` supports usage in `Node.js`, using `fetch` API (`nodejs >= 17.5.0`).

## Features

- Use `Fetch API` on modern browsers or Node.js
- Use `XMLHttpRequest` on older browsers
- Supports `middleware` for handling request and response
- Supports the Promise API
- Transform request and response data
- Abort requests by [`TimeoutAbortController`](#timeoutabortcontroller)
- Automatic transforms for JSON response data, and supports custom transformer
- Automatic data object serialization to `multipart/form-data` and `x-www-form-urlencoded` body encodings

## Install

### NPM

```sh
pnpm add requete
```

```sh
yarn add requete
```

```sh
npm i -S requete
```

### CDN

```html
<!-- using jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/requete/index.umd.min.js"></script>
<!-- or using unpkg -->
<script src="https://unpkg.com/requete/index.umd.min.js"></script>
```

## Usage

First, you can import `requete` and use it directly.

```ts
import requete from 'requete'

// Make a GET request
requete.get('https://httpbin.org/get')

// Make a POST request
requete.post('https://httpbin.org/post', { id: 1 })
```

You can also create an instance and specify request configs by calling the `create()` function:

```ts
import { create } from 'requete'

const requete = create({ baseURL: 'https://httpbin.org' })

// Make a GET request
requete
  .get<IData>('/post')
  .then((r) => r.data)
  .catch((error) => {
    console.log(error) // error as `RequestError`
  })
```

For commonjs module, `require` it:

```js
const requete = require('requete')

// use default instance
requete.get('https://httpbin.org/post')

// create new instance
const http = requete.create({ baseURL: 'https://httpbin.org' })
// Make a POST request
http.post('/post', { id: 1 })
```

For browser:

```html
<script src="https://cdn.jsdelivr.net/npm/requete"></script>

<script>
  // use default instance
  requete.get('https://httpbin.org/get')

  // create new instance
  const http = requete.create()
</script>
```

### Request Methods

The following aliases are provided for convenience:

```ts
requete.request<D = any>(config: IRequest): Promise<IContext<D>>
requete.get<D = any>(url: string, config?: IRequest): Promise<IContext<D>>
requete.delete<D = any>(url: string, config?: IRequest): Promise<IContext<D>>
requete.head<D = any>(url: string, config?: IRequest): Promise<IContext<D>>
requete.options<D = any>(url: string, config?: IRequest): Promise<IContext<D>>
requete.post<D = any>(url: string, data?: RequestBody, config?: IRequest): Promise<IContext<D>>
requete.put<D = any>(url: string, data?: RequestBody, config?: IRequest): Promise<IContext<D>>
requete.patch<D = any>(url: string, data?: RequestBody, config?: IRequest): Promise<IContext<D>>
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

requete.delete('/users/profile/123')

requete.put('/users/profile/123', { name: 'Jay Chou' })
```

### Use Middleware

`requete.use` for add a middleware function to requete. It returns this, so is chainable.

- The calling order of middleware should follow the **Onion Model**.
  like [`Koa middleware`](https://github.com/koajs/koa/blob/master/docs/guide.md#writing-middleware).
- `ctx` is the requete context object, type `IContext`. more information in [here](#response-typings).
- `next()` must be called asynchronously in middleware
- **Throwing an exception in middleware will break the middleware execution chain.**
- Even if `ctx.ok === false`, there`s no error will be thrown in middleware.

```ts
requete
  .use(async (ctx, next) => {
    const token = getToken()
    // throw a `RequestError` if unauthorize
    if (!token) ctx.throw('unauthorize')
    // set Authorization header
    else ctx.set('Authorization', token)

    // wait for request responding
    await next()

    // when unauthorized, re-authenticate.
    if (ctx.status === 401) reauthenticate()
  })
  .use((ctx, next) =>
    next().then(() => {
      // throw a `RequestError` and break the subsequent execution
      if (!ctx.data.some_err_code === '<error_code>') {
        ctx.throw('Server Error')
      }
    })
  )
```

## Request Config

### Config for create instance.

> `create(config?: RequestConfig)`

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
  /** enable logger or set logger level # */
  verbose?: boolean | number
  /**
   * parse json function
   * (for transform response)
   * @default JSON.parse
   */
  toJSON?(body: string): any
}
```

`config.verbose` is used to toggle the logger output (instead of logger middleware).

- set `true` or `2`: output `info` and `error` level
- set `1`: output `error` level
- set `false` or `0` or not set: no output

### Config for request methods.

> `requete.request(config?: IRequest)`

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
   * @default new TimeoutAbortController(timeout)
   */
  abort?: TimeoutAbortController | null
  /** specify request adapter */
  adapter?: Adapter
  /** flexible custom field */
  custom?: any
}
```

### Request Config Defaults

You can specify request config defaults globally, that will be applied to every request.
And the `Requete.defaults` is defined [here](https://github.com/rexerwang/requete/blob/main/src/core/Requete.ts#L17).

```ts
import { Requete } from 'requete'

Requete.defaults.baseURL = 'https://your-api.com'
Requete.defaults.timeout = 60000
Requete.defaults.responseType = 'json'
Requete.defaults.headers = { 'X-Request-Id': 'requete' }
```

## Response Typings

The response for a request is a context object, specifically of type `IContext`, which contains the following information.

```ts
interface IResponse<Data = any> {
  headers: Headers
  ok: boolean
  redirected: boolean
  status: number
  statusText: string
  type: ResponseType
  url: string
  data: Data
  /** response text when responseType is `json` or `text` */
  responseText?: string
}

interface IContext<Data = any> extends IResponse<Data> {
  /**
   * request config.
   * and empty `Headers` object as default
   */
  request: IRequest & { headers: Headers }

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
  /**
   * Assign to current context
   */
  assign(context: Partial<IContext>): void

  /**
   * Replay current request.
   * And assign new context to current, with replay`s response
   */
  replay(): Promise<void>
}
```

In middleware, the first argument is `ctx` of type `IContext`. You can call methods such as `ctx.set`, `ctx.throw`, `ctx.abort` before sending the request (i.e., before the `await next()` statement).
Otherwise, if these methods are called in other cases, a `RequestError` will be thrown.

`ctx.replay` is used to replay the request in middleware or other case.  
After respond, will assign new context to current, with replay\`s response,
And will add counts of replay in `ctx.request.custom.replay`.

Examples:

```ts
const auth = {
  token: '<token>',
  authenticate: requete.post('/authenticate').then((r) => {
    auth.token = r.data.token
  }),
}

requete.use(async (ctx, next) => {
  ctx.set('Authorization', auth.token)

  await next()

  // when unauthorized, re-authenticate
  // Maybe causes dead loop if always respond 401
  if (ctx.status === 401) {
    await auth.authenticate()
    // replay request after re-authenticated.
    await ctx.replay()
  }
})
```

## RequestError

`RequestError` inherits from `Error`, contains the request context information.

It should be noted that all exceptions in requete are `RequestError`.

```ts
class RequestError extends Error {
  name = 'RequestError'
  ctx: IContext

  constructor(errMsg: string | Error, ctx: IContext)
}
```

### Example

If needed, you can import `RequestError` it from `requete`

```ts
import { RequestError } from 'requete'

throw new RequestError('<error message>', ctx)
throw new RequestError(new Error('<error message>'), ctx)
```

Throw `RequestError` in requete middleware

```ts
// in requete middleware
ctx.throw('<error message>')
```

Caught `RequeteError` in request

```ts
// promise.catch
requete.post('/api').catch((e) => {
  console.log(e.name) // "RequestError"
  console.log(e.ctx.status) // response status
  console.log(e.ctx.headers) // response header
})

// try-catch
try {
  await requete.post('/api')
} catch (e) {
  console.log(e.name) // "RequestError"
  console.log(e.ctx.status) // response status
  console.log(e.ctx.headers) // response header
}
```

## TimeoutAbortController

it is used to auto-abort requests when timeout, and you can also call `abort()` to terminate them at any time. It is implemented based on [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).

In the requete configuration, you can add the `TimeoutAbortController` through the `abort` field.  
It should be noted that if you set the `timeout` field in config and unset the `abort` field, `requete` will add the `TimeoutAbortController` by default to achieve timeout termination.

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

/** By `abort` config */
const controller = new TimeoutAbortController(5000)
requete
  .get('https://httpbin.org/delay/10', { abort: controller })
  .catch((e) => {
    console.error(e) // "canceled"
  })
controller.abort('canceled') // you can abort request

/** By `timeout` config */
requete.get('https://httpbin.org/delay/10', { timeout: 5000 })
```

## Request Adapter

There are two request adapters in requete: `FetchAdapter`, `XhrAdapter`.

- **In Browser:** using `FetchAdapter` as default, and `XhrAdapter` is used as a fallback.
- **In Node.js:** using `FetchAdapter`.

Of course, you can also customize which adapter to use by declaring the `adapter` field in config.
For example, in browser environment, when obtaining download or upload progress events, you can choose to use the `XhrAdapter`. (like [Axios](https://github.com/axios/axios#request-config))

```ts
import requete, { XhrAdapter } from 'requete'

requete.get('/download-or-upload', {
  adapter: new XhrAdapter({ onDownloadProgress(e) {}, onUploadProgress(e) {} }),
})
```

Additionally, `requete` also supports custom adapters by inheriting the `abstract class Adapter` and implementing the `request` method.

```ts
abstract class Adapter {
  abstract request(ctx: IContext): Promise<IResponse>
}
```

### Example

```ts
// CustomAdapter.ts

import { Adapter } from 'requete/adapter'

export class CustomAdapter extends Adapter {
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

**In ES Module:**

```js
import 'requete/polyfill'
```

**In Browser:**

```html
<!-- using jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/requete/polyfill.umd.min.js"></script>
<!-- using unpkg -->
<script src="https://unpkg.com/requete/polyfill.umd.min.js"></script>
```
