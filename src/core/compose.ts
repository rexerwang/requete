export type Middleware<T> = (ctx: T, next: () => Promise<void>) => Promise<void>

export function compose<T>(middlewares: Middleware<T>[]) {
  return (context: T, next: Middleware<T>) => {
    // last called middleware #
    let index = -1
    return dispatch(0)
    async function dispatch(i: number): Promise<void> {
      if (i <= index) throw new Error('next() called multiple times')

      index = i

      const middleware = i === middlewares.length ? next : middlewares[i]
      if (middleware) return await middleware(context, () => dispatch(i + 1))
    }
  }
}
