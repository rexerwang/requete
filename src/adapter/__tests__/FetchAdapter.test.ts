import { toAny } from 'test/utils'

describe('FetchAdapter specs', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(
      toAny(
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          statusText: 'ok',
          text: vi.fn().mockResolvedValue('null'),
          url: '/do-mock',
        })
      )
    )
  })

  it('should transform request body for fetch api', () => {})
})
