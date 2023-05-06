import {
  AbortController as AbortControllerPolyfill,
  AbortSignal as AbortSignalPolyfill,
} from 'abortcontroller-polyfill/src/abortcontroller'
import { Headers as HeadersPolyfill } from 'headers-polyfill'

~(function (global) {
  const polyfill = (propertyKey, propertyValue) => {
    Object.defineProperty(global, propertyKey, {
      writable: true,
      enumerable: false,
      configurable: true,
      value: propertyValue,
    })
  }

  if (!global.Headers) {
    polyfill('Headers', HeadersPolyfill)
  }

  if (!global.AbortController) {
    polyfill('AbortController', AbortControllerPolyfill)
    polyfill('AbortSignal', AbortSignalPolyfill)
  }
})(typeof globalThis !== 'undefined' ? globalThis : global || self)
