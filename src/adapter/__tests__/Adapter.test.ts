import { createAdapter, FetchAdapter, XhrAdapter } from '..'

describe('createAdapter specs', () => {
  it('should thrown a ReferenceError when all adapters are not supported', () => {
    // @ts-ignore
    FetchAdapter.supported = false
    // @ts-ignore
    XhrAdapter.supported = false

    expect(createAdapter).toThrow(ReferenceError)
    expect(createAdapter).toThrow(
      'No adapter supported in current environment.'
    )
  })

  it('should return FetchAdapter instance when it supported', () => {
    // @ts-ignore
    FetchAdapter.supported = true

    expect(createAdapter()).toBeInstanceOf(FetchAdapter)
  })

  it('should return XhrAdapter instance when it supported & FetchAdapter not supported', () => {
    // @ts-ignore
    FetchAdapter.supported = false
    // @ts-ignore
    XhrAdapter.supported = true

    expect(createAdapter()).toBeInstanceOf(XhrAdapter)
  })
})
