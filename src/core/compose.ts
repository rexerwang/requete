import type { IContext, Middleware } from './Requete'

export function compose(middlewares: Middleware[]) {
  return (context: IContext, next: Middleware) => {
    // last called middleware #
    let index = -1
    return dispatch(0).catch((e) => context.throw(e))
    async function dispatch(i: number): Promise<void> {
      if (i <= index) throw new Error('next() called multiple times')

      index = i

      const middleware = i === middlewares.length ? next : middlewares[i]
      if (middleware) return await middleware(context, () => dispatch(i + 1))
    }
  }
}
