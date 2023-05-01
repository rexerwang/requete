import { mergeHeaders, parseHeaders } from '../headers'

describe('headers specs', () => {
  it('mergeHeaders', () => {
    expect(
      mergeHeaders(
        {
          'content-type': 'text/html; charset=utf-8',
          'content-length': '1024',
        },
        undefined,
        {
          'x-xss-protection': '1; mode=block',
          'content-type': 'application/json',
        }
      )
    ).toEqual(
      new Headers({
        'x-xss-protection': '1; mode=block',
        'content-type': 'application/json',
        'content-length': '1024',
      })
    )
  })

  it('parseHeaders', () => {
    const rawHeader = `x-frame-options: DENY\r\n
      content-type: text/html; charset=utf-8\r\n
      content-length: 1024\r\n
      x-xss-protection: 1; mode=block\r\n`

    expect(parseHeaders(rawHeader)).toEqual(
      new Headers({
        'x-frame-options': 'DENY',
        'content-type': 'text/html; charset=utf-8',
        'content-length': '1024',
        'x-xss-protection': '1; mode=block',
      })
    )
  })
})
