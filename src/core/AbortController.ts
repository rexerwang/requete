export class TimeoutAbortController {
  static readonly supported = typeof AbortController !== 'undefined'

  private controller: AbortController
  private timeoutId: ReturnType<typeof setTimeout> | null = null

  constructor(timeout: number) {
    if (!TimeoutAbortController.supported)
      throw new ReferenceError(
        'Not support AbortController in current environment.'
      )

    this.controller = new AbortController()
    if (timeout > 0) {
      this.timeoutId = setTimeout(
        () => this.controller.abort('timeout'),
        timeout
      )
    }
  }

  get signal() {
    return this.controller.signal
  }

  abort(reason?: any) {
    this.controller.abort(reason)
    this.clear()
  }

  clear() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  get [Symbol.toStringTag]() {
    return 'TimeoutAbortController'
  }
}
