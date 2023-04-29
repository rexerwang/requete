import type { RequestError } from '../core/RequestError'
import type { IContext, Middleware } from '../core/Requete'

const toObject = (headers?: Headers) => {
  const obj: any = {}
  headers?.forEach((value, key) => {
    obj[key] = value
  })
  return obj
}

const res = (ctx: IContext) => ({
  request: {
    data: ctx.request.data,
    params: ctx.request.params,
    headers: toObject(ctx.request.headers),
  },
  response: {
    data: ctx.data,
    headers: toObject(ctx.headers),
    responseText: ctx.responseText,
  },
})

class Logger {
  constructor(private name: string) {}

  info(...message: any[]) {
    console.log(this.name, ...message)
  }

  error(e: RequestError) {
    // if (e.name !== 'RequestError') return console.error(e)
    const { request, url, status, statusText } = e.ctx

    console.error(
      `${this.name} ${request.method} ${url} ${status} (${
        status === -1 ? 'Before Request' : statusText
      })\n%o\n${e.stack}`,
      res(e.ctx)
    )
  }
}

export function logger(name = 'Requete'): Middleware {
  const logger = new Logger(`[${name}]`)

  return async (ctx, next) => {
    logger.info(`${ctx.request.method} ${ctx.url}`, res(ctx).request)

    try {
      await next()
      logger.info(
        `${ctx.request.method} ${ctx.url} ${ctx.status} (${ctx.statusText})`,
        res(ctx).response
      )
    } catch (error) {
      logger.error(error as RequestError)
      throw error
    }
  }
}
