import type { RequestError } from '../core/RequestError'
import type { Middleware } from '../core/Requete'

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
      })\n${e.ctx}\n${e.stack}`
    )
  }
}

export function logger(name = 'Requete'): Middleware {
  const logger = new Logger(`[${name}]`)

  return async (ctx, next) => {
    logger.info(`${ctx.request.method} ${ctx.url}`, ctx)

    try {
      await next()
      logger.info(
        `${ctx.request.method} ${ctx.url} ${ctx.status} (${ctx.statusText})`,
        ctx
      )
    } catch (error) {
      logger.error(error as RequestError)
      throw error
    }
  }
}
