// @ts-ignore
import { Headers as HeadersPolyfill } from 'headers-polyfill'

~(function (self) {
  if (self.Headers) {
    return
  }

  Object.defineProperty(self, 'Headers', {
    writable: true,
    enumerable: false,
    configurable: true,
    value: HeadersPolyfill,
  })
})(typeof self !== 'undefined' ? self : global)
