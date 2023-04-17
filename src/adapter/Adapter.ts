import { IContext, IResponse } from '../types'

export abstract class Adapter {
  static readonly supported: boolean
  abstract request<D>(ctx: IContext<D>): Promise<IResponse<D>>
}
