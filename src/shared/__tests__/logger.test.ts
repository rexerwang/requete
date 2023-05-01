import { toAny } from 'test/utils'

import { Logger } from '../logger'
import { RequestError } from '../RequestError'

describe('Logger specs', () => {
  const logSpy = vi.spyOn(console, 'log').mockImplementation(toAny(vi.fn()))
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(toAny(vi.fn()))

  beforeEach(() => {
    logSpy.mockClear()
    errorSpy.mockClear()
  })

  it('should output both info & error log when given level == 2', () => {
    const logger = new Logger('logger', 2)

    logger.info('info')
    logger.error('error')

    expect(logSpy).toBeCalled()
    expect(errorSpy).toBeCalled()
  })

  it('should output only error log when given level == 1', () => {
    const logger = new Logger('logger', 1)

    logger.info('info')
    logger.error('error')

    expect(logSpy).not.toBeCalled()
    expect(errorSpy).toBeCalled()
  })

  it('should not output when given level == 0', () => {
    const logger = new Logger('logger', 0)

    logger.info('info')
    logger.error('error')

    expect(logSpy).not.toBeCalled()
    expect(errorSpy).not.toBeCalled()
  })

  it('should output info log with formatted message', () => {
    const logger = new Logger('logger', 2)

    logger.info('info')

    expect(logSpy).toBeCalledWith('[logger]', 'info')
  })

  it('should output request log with formatted message', () => {
    const logger = new Logger('logger', 2)

    logger.request(
      toAny({
        request: {
          method: 'GET',
          data: null,
          params: undefined,
          headers: new Headers({ 'x-header-a': 'a' }),
        },
        url: '/do-mock',
        data: null,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        responseText: 'null',
      })
    )

    expect(logSpy).toBeCalledWith('[logger]', 'GET /do-mock', {
      data: null,
      params: undefined,
      headers: { 'x-header-a': 'a' },
    })
  })

  it('should output response log with formatted message', () => {
    const logger = new Logger('logger', 2)

    logger.response(
      toAny({
        request: {
          method: 'GET',
          data: null,
          params: undefined,
          headers: new Headers({ 'x-header-a': 'a' }),
        },
        url: '/do-mock',
        status: 200,
        statusText: 'OK',
        data: null,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        responseText: 'null',
      })
    )

    expect(logSpy).toBeCalledWith('[logger]', 'GET /do-mock 200 (OK)', {
      data: null,
      responseText: 'null',
      headers: { 'content-type': 'application/json' },
    })
  })

  it('should output error log with formatted message when given a RequestError', () => {
    const logger = new Logger('logger', 2)

    const ctx = toAny({
      request: {
        method: 'GET',
        data: null,
        params: undefined,
        headers: new Headers({ 'x-header-a': 'a' }),
      },
      url: '/do-mock',
      status: 500,
      statusText: 'Internal Server Error',
      data: null,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      responseText: 'null',
    })
    const error = new RequestError('error', ctx)

    logger.error(error)

    expect(errorSpy).toBeCalledWith(
      '[logger] GET /do-mock 500 (Internal Server Error)\n%o\n' + error.stack,
      {
        request: {
          data: null,
          headers: {
            'x-header-a': 'a',
          },
          params: undefined,
        },
        response: {
          data: null,
          headers: {
            'content-type': 'application/json',
          },
          responseText: 'null',
        },
      }
    )
  })

  it('should output error log with formatted message when before request', () => {
    const logger = new Logger('logger', 2)

    const ctx = toAny({
      request: {
        method: 'GET',
        data: null,
        params: undefined,
        headers: new Headers({ 'x-header-a': 'a' }),
      },
      url: '/do-mock',
      status: -1,
    })

    const error = new RequestError('error', ctx)

    logger.error(error)

    expect(errorSpy).toBeCalledWith(
      '[logger] GET /do-mock -1 (Before Request)\n%o\n' + error.stack,
      {
        request: {
          data: null,
          headers: {
            'x-header-a': 'a',
          },
          params: undefined,
        },
        response: {
          data: undefined,
          headers: undefined,
          responseText: undefined,
        },
      }
    )
  })

  it('should output error log with formatted message when given an other error', () => {
    const logger = new Logger('logger', 2)

    logger.error('error')
    expect(errorSpy).toBeCalledWith('error')

    const error = new Error('error')
    logger.error(error)
    expect(errorSpy).toBeCalledWith(error)
  })
})
