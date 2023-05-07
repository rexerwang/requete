import { TimeoutAbortController } from '../AbortController'

describe('TimeoutAbortController specs', () => {
  it('should thrown a ReferenceError when AbortController not supported', () => {
    // @ts-ignore
    TimeoutAbortController.supported = false

    expect(() => new TimeoutAbortController(0)).toThrow(ReferenceError)
    expect(() => new TimeoutAbortController(0)).toThrow(
      'Not support AbortController in current environment.'
    )

    // @ts-ignore
    TimeoutAbortController.supported = true
  })

  it('should return [object TimeoutAbortController] when called with Object.prototype.toString', () => {
    expect(Object.prototype.toString.call(new TimeoutAbortController(0))).toBe(
      '[object TimeoutAbortController]'
    )
  })
})
