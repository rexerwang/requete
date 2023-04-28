const assert = require('assert/strict')

const requete = require('requete')
assert(typeof requete, 'function')
assert(typeof requete.RequestError, 'function')
assert(typeof requete.Requete, 'function')
assert(typeof requete.TimeoutAbortController, 'function')
assert(typeof requete.create, 'function')
assert(typeof requete.default, 'function')

const { logger } = require('requete/middleware')
assert(typeof logger, 'function')

const { Adapter, FetchAdapter, XhrAdapter, create } = require('requete/adapter')
assert(typeof Adapter, 'function')
assert(typeof FetchAdapter, 'function')
assert(typeof XhrAdapter, 'function')
assert(typeof create, 'function')

console.log('All tests passed.')
