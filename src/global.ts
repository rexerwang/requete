import instance, {
  Adapter,
  FetchAdapter,
  RequestError,
  Requete,
  TimeoutAbortController,
  XhrAdapter,
} from './index'

const requete: any = instance

requete.Requete = Requete
requete.RequestError = RequestError
requete.TimeoutAbortController = TimeoutAbortController
requete.Adapter = Adapter
requete.FetchAdapter = FetchAdapter
requete.XhrAdapter = XhrAdapter

export default requete
