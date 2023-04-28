import type { RequestBody } from '../core/Requete'

export function transformRequestBody(data?: RequestBody) {
  const toString = Object.prototype.toString.call(data)

  let requestBody: any = data
  let contentType = ''

  switch (toString) {
    case '[object Undefined]':
    case '[object Null]':
      break
    case '[object String]':
    case '[object URLSearchParams]':
      contentType = 'application/x-www-form-urlencoded;charset=utf-8'
      break
    case '[object FormData]':
    case '[object Blob]':
    case '[object ReadableStream]':
    case '[object ArrayBuffer]':
    case '[object DataView]':
    case '[object BigInt64Array]':
    case '[object BigUint64Array]':
    case '[object Float32Array]':
    case '[object Float64Array]':
    case '[object Int8Array]':
    case '[object Int16Array]':
    case '[object Int32Array]':
    case '[object Uint8Array]':
    case '[object Uint8ClampedArray]':
    case '[object Uint16Array]':
    case '[object Uint32Array]':
      contentType = 'multipart/form-data;charset=utf-8'
      break
    case '[object Object]':
    case '[object Array]':
      requestBody = JSON.stringify(data)
      contentType = 'application/json;charset=utf-8'
      break
    default:
      throw new TypeError('Invalid request body type: ' + toString)
  }

  return { requestBody, contentType }
}
