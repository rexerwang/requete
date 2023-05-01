import { equal } from 'assert/strict'

import requete, {
  RequestError,
  Requete,
  TimeoutAbortController,
  create,
} from 'requete'
equal(typeof requete, 'object', 'requete')
equal(typeof requete.request, 'function', 'requete.request')
equal(typeof RequestError, 'function', 'requete.RequestError')
equal(typeof Requete, 'function', 'requete.Requete')
equal(
  typeof TimeoutAbortController,
  'function',
  'requete.TimeoutAbortController'
)
equal(typeof create, 'function', 'requete.create')

import { logger } from 'requete/middleware'
equal(typeof logger, 'function', 'requete/middleware:logger')

import {
  Adapter,
  FetchAdapter,
  XhrAdapter,
  createAdapter,
} from 'requete/adapter'
equal(typeof Adapter, 'function', 'requete/adapter:Adapter')
equal(typeof FetchAdapter, 'function', 'requete/adapter:FetchAdapter')
equal(typeof XhrAdapter, 'function', 'requete/adapter:XhrAdapter')
equal(typeof createAdapter, 'function', 'requete/adapter:createAdapter')

import {
  getUri,
  mergeHeaders,
  parseHeaders,
  Logger,
  pick,
  progressEventReducer,
  transformRequestBody,
} from 'requete/shared'
equal(typeof getUri, 'function', 'requete/shared:getUri')
equal(typeof mergeHeaders, 'function', 'requete/shared:mergeHeaders')
equal(typeof parseHeaders, 'function', 'requete/shared:parseHeaders')
equal(typeof Logger, 'function', 'requete/shared:Logger')
equal(typeof pick, 'function', 'requete/shared:pick')
equal(
  typeof progressEventReducer,
  'function',
  'requete/shared:progressEventReducer'
)
equal(
  typeof transformRequestBody,
  'function',
  'requete/shared:transformRequestBody'
)

console.log('All esm exports specs passed.')
