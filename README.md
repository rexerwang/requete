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
<script src="https://cdn.jsdelivr.net/npm/requete"></script>
<!-- or using unpkg -->
<script src="https://unpkg.com/requete"></script>

<!-- minify js -->
<script src="https://cdn.jsdelivr.net/npm/requete/index.umd.min.js"></script>
```

## Usage

First, you can import `requete` and use it directly.

```ts
import requete from 'requete'

// Make a GET request
requete.get('https://your-api.com/api/posts')

// Make a POST request
requete.post('https://your-api.com/api/posts', { id: 1 })
```

You can also create an instance and specify request configs by calling the `create()` function:

```ts
import { create } from 'requete'

const requete = create({ baseURL: 'https://your-api.com/api' })

// Make a GET request
requete
  .get<IPost>('/posts')
  .then((r) => r.data)
  .catch((error) => {
    error.print() // error as `RequestError`
  })
```

Similarly, you can also use `Requete` class:

```ts
import { Requete } from 'requete'

const requete = new Requete()
```

For commonjs module, `require` it:

```js
const requete = require('requete')

// use default instance
requete.get('https://your-api.com/api/posts')

// create new instance
const http = requete.create({ baseURL: 'https://your-api.com/api' })
// or new class
// const http = requete.Requete()

// Make a POST request
http.post('posts', { id: 1 })
```

For browser:

```html
<script src="https://cdn.jsdelivr.net/npm/requete"></script>

<script>
  // use default instance
  requete.get('/api/posts')

  // create new instance
  const http = requete.create()
  // or new class
  // const http = requete.Requete()
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
      if (!ctx.data.some_err_code === '<error_code>') {
        ctx.throw('Server Error')
      }
    })
  )
```

#### Builtin middleware

`requete` also provides the following middleware for use:

1. `logger`: used to output request logs. In general, its used at **last**.

```ts
import requete from 'requete'
import { logger } from 'requete/middleware'

requete.use(...).use(logger()) // requete.use(logger('<logger_name>'))
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

In middleware, the first argument is `ctx` of type `IContext`. You can call methods such as `ctx.set`, `ctx.throw`, `ctx.abort` before sending the request (i.e., before the await next() statement).  
Otherwise, if these methods are called in other cases, a `RequestError` will be thrown.

## RequestError

`RequestError` inherits from `Error`, contains the request context information, and provides the formatted output method (`print()`).

It should be noted that all exceptions in requete are `RequestError`.

```ts
class RequestError extends Error {
  name = 'RequestError'
  ctx: IContext

  constructor(errMsg: string | Error, ctx: IContext)

  print(): this
}
```

### Example

If needed, you can import `RequestError` it from `requete`

```ts
import { RequestError } from 'requete'

throw new RequestError('<error message>', ctx)
throw new RequestError(new Error('<error message>', ctx))
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

/** 1. by `abort` config */
const controller = new TimeoutAbortController(60000)
requete.get('/download-large-thing', { abort: controller }).catch((e) => {
  e.print() // "canceled"
})
// you can abort request
controller.abort('canceled')

/** 2. by `timeout` config */
requete.get('/download-large-thing', { timeout: 60000 })
```

## Request Adapter

There are two request adapters in requete: `FetchAdapter`, `XhrAdapter`.

- **In Browser:** using `FetchAdapter` as default, and `XhrAdapter` is used as a fallback.
- **In Node.js:** using `FetchAdapter`.

Of course, you can also customize which adapter to use by declaring the `adapter` field in config.
For example, in browser environment, when obtaining download or upload progress events, you can choose to use the `XhrAdapter`. (like [Axios](https://github.com/axios/axios#request-config))

```ts
import requete from 'requete'
import { XhrAdapter } from 'requete/adapter'

requete.get('/download-or-upload', {
  adapter: new XhrAdapter({ onDownloadProgress(e) {}, onUploadProgress(e) {} }),
})
```

Additionally, `requete` also supports custom adapters by inheriting the `abstract class Adapter` and implementing the `request` method.

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
  /** response body parser for Requete */
  body(): Promise<Data>
  /** response text when responseType is `json` or `text` */
  responseText?: string
}

abstract class Adapter {
  abstract request<D>(ctx: IContext<D>): Promise<IResponse<D>>
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
