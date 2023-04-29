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

const { logger } = require('requete/middleware')
assert.equal(typeof logger, 'function', 'requete/middleware:logger')

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

console.log('All tests passed.')
