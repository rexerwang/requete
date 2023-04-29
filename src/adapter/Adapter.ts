import type { IContext, IResponse } from '../core/Requete'

export abstract class Adapter {
  static readonly supported: boolean
  abstract request(ctx: IContext): Promise<IResponse>
}
