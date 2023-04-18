import { toAny } from 'test/utils'

import { Requete } from '../Requete'

describe('response specs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    { data: { data: 'mockData' }, dataType: 'json' },
    { data: new FormData(), dataType: 'formData' },
    { data: new Blob(), dataType: 'blob' },
    { data: new ArrayBuffer(0), dataType: 'arrayBuffer' },
    { data: 'text', dataType: 'text' },
  ])(
    'should respond $dataType type when request successfully',
    async ({ data, dataType }) => {
      const response: any = {
        ok: true,
        status: 200,
        statusText: 'ok',
        [dataType]: vi.fn().mockResolvedValue(data),
        url: '/do-mock',
      }

      // add text func for json type
      if (dataType === 'json') {
        response.text = vi.fn().mockResolvedValue(JSON.stringify(data))
      }

      // mock fetch api
      vi.spyOn(global, 'fetch').mockImplementation(
        toAny(vi.fn().mockResolvedValue(response))
      )

      const res = await new Requete().get('/do-mock', {
        responseType: dataType as any,
      })

      expect(res.data).toEqual(data)
    }
  )
})
