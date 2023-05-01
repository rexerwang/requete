import type { Middleware } from 'requete'
import { Logger } from 'requete/shared'

interface IOption {
  name?: string
  level?: number
}

/** @deprecated Use `config.verbose` to enable logger */
export function logger({ name, level }: IOption = {}): Middleware {
  const logger = new Logger(name ?? 'Requete', level ?? 2)

  return async (ctx, next) => {
    logger.request(ctx)

    try {
      await next()
      logger.response(ctx)
    } catch (e: any) {
      logger.error(e)
      throw e
    }
  }
}
