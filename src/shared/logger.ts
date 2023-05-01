import type { IContext } from 'requete'

import { RequestError } from './RequestError'

export class Logger {
  constructor(private name: string, private level: number) {
    this.name = name && `[${name}]`
  }

  toObject(headers?: Headers) {
    const obj: any = {}
    headers?.forEach((value, key) => {
      obj[key] = value
    })
    return obj
  }

  res(ctx: IContext) {
    return {
      request: {
        data: ctx.request.data,
        params: ctx.request.params,
        headers: this.toObject(ctx.request.headers),
      },
      response: {
        data: ctx.data,
        headers: this.toObject(ctx.headers),
        responseText: ctx.responseText,
      },
    }
  }

  info(...message: any[]) {
    if (this.level < 2) return

    console.log(this.name, ...message)
  }

  error(e: Error | string) {
    if (this.level < 1) return
    if (!(e instanceof RequestError)) return console.error(e)

    const { ctx } = e as RequestError
    const { request, url, status, statusText } = ctx

    console.error(
      `${this.name} ${request.method} ${url} ${status} (${
        status === -1 ? 'Before Request' : statusText
      })\n%o\n${e.stack}`,
      this.res(ctx)
    )
  }

  request(ctx: IContext) {
    this.info(`${ctx.request.method} ${ctx.url}`, this.res(ctx).request)
  }

  response(ctx: IContext) {
    this.info(
      `${ctx.request.method} ${ctx.url} ${ctx.status} (${ctx.statusText})`,
      this.res(ctx).response
    )
  }
}
