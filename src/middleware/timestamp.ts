import type { Method, Middleware } from 'requete'

export function timestamp(key = '_', methods: Method[] = ['GET']): Middleware {
  return async function addTimestamp(ctx, next) {
    if (methods.includes(ctx.request.method)) {
      ctx.params({ [key]: Date.now() })
    }

    await next()
  }
}
