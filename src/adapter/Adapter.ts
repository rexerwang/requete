import type { IContext, IResponse } from 'requete'

export abstract class Adapter {
  static readonly supported: boolean
  abstract request(ctx: IContext): Promise<IResponse>
}
