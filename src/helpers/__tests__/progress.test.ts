import { progressEventReducer } from '../progress'

describe('progress specs', () => {
  it('should calc progress rate correctly', () => {
    // mock progress interval
    let times = 0
    vi.spyOn(Date, 'now').mockImplementation(() => ++times * 250)

    let progress: any = {}
    const reducedListener = progressEventReducer((v) => {
      progress = v
    })

    // 1st load
    const event: any = { loaded: 50, total: 10240, lengthComputable: true }
    reducedListener(event)
    expect(progress).toMatchInlineSnapshot(`
      {
        "bytes": 50,
        "download": false,
        "estimated": undefined,
        "event": {
          "lengthComputable": true,
          "loaded": 50,
          "total": 10240,
        },
        "loaded": 50,
        "progress": 0.0048828125,
        "rate": undefined,
        "total": 10240,
        "upload": true,
      }
    `)

    // 2nd load
    event.loaded = 1500
    reducedListener(event)
    expect(progress).toMatchInlineSnapshot(`
      {
        "bytes": 1450,
        "download": false,
        "estimated": 43.7,
        "event": {
          "lengthComputable": true,
          "loaded": 1500,
          "total": 10240,
        },
        "loaded": 1500,
        "progress": 0.146484375,
        "rate": 200,
        "total": 10240,
        "upload": true,
      }
    `)

    // disable lengthComputable
    event.lengthComputable = false
    event.total = undefined
    reducedListener(event)
    expect(progress).toMatchInlineSnapshot(`
      {
        "bytes": 0,
        "download": false,
        "estimated": undefined,
        "event": {
          "lengthComputable": false,
          "loaded": 1500,
          "total": undefined,
        },
        "loaded": 1500,
        "progress": undefined,
        "rate": 3000,
        "total": undefined,
        "upload": true,
      }
    `)
  })
})
