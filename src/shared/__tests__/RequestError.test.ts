import { toAny } from 'test/utils'

import { RequestError } from '../RequestError'

describe('RequestError specs', () => {
  it('should return [object RequestError] when called with Object.prototype.toString', () => {
    expect(
      Object.prototype.toString.call(new RequestError('test', toAny({})))
    ).toBe('[object Error]')
  })
})
