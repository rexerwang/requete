import type { RequestError } from '../core/RequestError'
import type { RequestMiddleware } from '../core/Requete'

class Logger {
  constructor(private name: string) {}

  info(...message: any[]) {
    console.log(this.name, ...message)
  }

  error(e: RequestError) {
    const { request, url, status, statusText } = e.ctx

    console.error(
      this.name,
      `${request.method} ${url} ${status} (${
        status === -1 ? 'Before Request' : statusText
      })\n%o\n${e.stack}`,
      e.ctx
    )
  }
}

export function logger(name = 'Requete'): RequestMiddleware {
  const logger = new Logger(`[${name}]`)

  return async (ctx, next) => {
    logger.info(`${ctx.request.method} ${ctx.url}`, {
      data: ctx.request.data,
      headers: ctx.request.headers,
    })

    try {
      await next()
      logger.info(
        `${ctx.request.method} ${ctx.url} ${ctx.status} (${ctx.statusText})`
      )
    } catch (error) {
      logger.error(error as RequestError)
      throw error
    }
  }
}
