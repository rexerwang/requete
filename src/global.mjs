import { Adapter, FetchAdapter, XhrAdapter } from './adapter'
import requete, { RequestError, Requete, TimeoutAbortController } from './index'
import * as Middleware from './middleware'

// exports core
requete.Requete = Requete
requete.RequestError = RequestError
requete.TimeoutAbortController = TimeoutAbortController

// exports adapter
requete.Adapter = Adapter
requete.FetchAdapter = FetchAdapter
requete.XhrAdapter = XhrAdapter

// exports middleware
requete.Middleware = Middleware

export default requete
