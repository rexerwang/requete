import { FetchAdapter, XhrAdapter } from './adapter'
import requete, {
  create,
  RequestError,
  Requete,
  TimeoutAbortController,
} from './index'
import * as Middleware from './middleware'

// exports core
requete.create = create
requete.Requete = Requete
requete.RequestError = RequestError
requete.TimeoutAbortController = TimeoutAbortController

// exports adapter
requete.FetchAdapter = FetchAdapter
requete.XhrAdapter = XhrAdapter

// exports middleware
requete.Middleware = Middleware

export default requete
