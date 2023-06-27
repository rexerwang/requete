const assert = require('assert/strict')

const requete = require('requete')
assert.equal(typeof requete, 'object', 'requete')
assert.equal(typeof requete.RequestError, 'function', 'requete.RequestError')
assert.equal(typeof requete.Requete, 'function', 'requete.Requete')
assert.equal(
  typeof requete.TimeoutAbortController,
  'function',
  'requete.TimeoutAbortController'
)
assert.equal(typeof requete.create, 'function', 'requete.create')
assert.equal(typeof requete.FetchAdapter, 'function', 'requete.FetchAdapter')
assert.equal(typeof requete.XhrAdapter, 'function', 'requete.XhrAdapter')

const { timestamp } = require('requete/middleware')
assert.equal(typeof timestamp, 'function', 'requete/middleware:timestamp')

const {
  Adapter,
  FetchAdapter,
  XhrAdapter,
  createAdapter,
} = require('requete/adapter')
assert.equal(typeof Adapter, 'function', 'requete/adapter:Adapter')
assert.equal(typeof FetchAdapter, 'function', 'requete/adapter:FetchAdapter')
assert.equal(typeof XhrAdapter, 'function', 'requete/adapter:XhrAdapter')
assert.equal(typeof createAdapter, 'function', 'requete/adapter:createAdapter')

const {
  getUri,
  mergeHeaders,
  parseHeaders,
  Logger,
  pick,
  progressEventReducer,
  transformRequestBody,
} = require('requete/shared')
assert.equal(typeof getUri, 'function', 'requete/shared:getUri')
assert.equal(typeof mergeHeaders, 'function', 'requete/shared:mergeHeaders')
assert.equal(typeof parseHeaders, 'function', 'requete/shared:parseHeaders')
assert.equal(typeof Logger, 'function', 'requete/shared:Logger')
assert.equal(typeof pick, 'function', 'requete/shared:pick')
assert.equal(
  typeof progressEventReducer,
  'function',
  'requete/shared:progressEventReducer'
)
assert.equal(
  typeof transformRequestBody,
  'function',
  'requete/shared:transformRequestBody'
)

console.log('All commonjs exports specs passed.')
