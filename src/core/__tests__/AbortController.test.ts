import { TimeoutAbortController } from '../AbortController'

it('should thrown a ReferenceError when AbortController not supported', () => {
  // @ts-ignore
  TimeoutAbortController.supported = false

  expect(() => new TimeoutAbortController(0)).toThrow(ReferenceError)
  expect(() => new TimeoutAbortController(0)).toThrow(
    'Not support AbortController in current environment.'
  )
})
