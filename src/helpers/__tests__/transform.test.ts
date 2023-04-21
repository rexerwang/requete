import { transformRequestBody } from '../transform'

describe('transform specs', () => {
  it.each([
    undefined,
    null,
    '1',
    new FormData(),
    new Blob(['1']),
    new ArrayBuffer(1),
    { a: 1 },
    [{ a: 1 }],
  ])('should transform requestBody correctly when given `%o`', (data) => {
    expect(transformRequestBody(data)).toMatchSnapshot()
  })

  it('should thrown TypeError when given a number', () => {
    expect(() => transformRequestBody(1 as any)).toThrow(TypeError)
    expect(() => transformRequestBody(1 as any)).toThrow(
      /Invalid request body type/
    )
  })
})
