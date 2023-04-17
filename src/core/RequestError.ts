import type { IContext } from '../types'

export class RequestError extends Error {
  name = 'RequestError'

  ctx: IContext

  constructor(errMsg: string | Error, ctx: IContext) {
    const isError = typeof errMsg !== 'string'

    super(isError ? errMsg.message : errMsg)

    if (isError) {
      this.stack = errMsg.stack
      this.cause = errMsg.cause
    }

    this.ctx = ctx
  }

  print() {
    const { request, url, status, statusText } = this.ctx

    console.error(
      `${request.method} ${url} ${
        status === -1 ? '[Before Request]' : `${status} (${statusText})`
      }\n%o\n${this.stack}`,
      this.ctx
    )

    return this
  }
}
