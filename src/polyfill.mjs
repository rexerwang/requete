import {
  AbortController as AbortControllerPolyfill,
  AbortSignal as AbortSignalPolyfill,
} from 'abortcontroller-polyfill/src/abortcontroller'
import { Headers as HeadersPolyfill } from 'headers-polyfill'

~(function (self) {
  const polyfill = (propertyKey, propertyValue) => {
    Object.defineProperty(self, propertyKey, {
      writable: true,
      enumerable: false,
      configurable: true,
      value: propertyValue,
    })
  }

  if (!self.Headers) {
    polyfill('Headers', HeadersPolyfill)
  }

  if (!self.AbortController) {
    polyfill('AbortController', AbortControllerPolyfill)
    polyfill('AbortSignal', AbortSignalPolyfill)
  }
})(typeof self !== 'undefined' ? self : global)
