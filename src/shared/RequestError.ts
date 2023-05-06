import type { IContext } from 'requete'

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

  get [Symbol.toStringTag]() {
    return 'RequestError'
  }
}
