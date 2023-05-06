~(function (global) {
  global.stringifyRes = (res) => {
    if (res.name === 'RequestError') res = { message: res.message, ...res }

    const plainObject = (obj) => {
      return Object.entries(obj).reduce((plain, [key, value]) => {
        let plainValue

        const toString = Object.prototype.toString.call(value)
        switch (toString) {
          case '[object Function]':
          case '[object AsyncFunction]':
          case '[object Blob]':
          case '[object ReadableStream]':
          case '[object ArrayBuffer]':
            plainValue = toString
            break

          case '[object Headers]':
            plainValue = {}
            value.forEach((value, key) => {
              plainValue[key] = value
            })
            break

          case '[object TimeoutAbortController]':
            plainValue = {
              aborted: value.controller.signal.aborted,
              reason: value.controller.signal.reason,
            }
            break

          case '[object Object]':
            plainValue = plainObject(value)
            break

          default:
            plainValue = value
        }

        plain[key] = plainValue
        return plain
      }, {})
    }

    return JSON.stringify(plainObject(res), null, 4)
  }

  global.highlight = (code, language = 'json') =>
    hljs.highlight(code, { language }).value

  global.highlightRes = (res) => highlight(stringifyRes(res))

  global.renderRequest = (selector) => {
    const el = document.querySelector(selector)
    const httpEl = el.querySelector('.http')
    const resEl = el.querySelector('.res')

    return async (request) => {
      const r = await request.catch((e) => e)
      const ctx = r.ctx || r

      const statusText =
        ctx.statusText ||
        (ctx.status === 200 ? 'OK' : ctx.status === -1 ? 'Before Request' : '')

      const markdown = [
        `# ${ctx.request.method} ${ctx.url} ${ctx.status} (${statusText})`,
      ]
      if (r.message) markdown.push(`## Error: ${r.message}`)

      httpEl.innerHTML = highlight(markdown.join('\n\n'), 'markdown')

      resEl.innerHTML = highlightRes(ctx)

      return ctx
    }
  }

  global.createRequestFactory = (requete) => (expression) => {
    const [method, url] = expression.split(' ')
    const invoke = requete[method].bind(requete)

    const root = document.querySelector('main')
    const el = document.createElement('div')
    el.classList.add(method)
    el.setAttribute('data-method', method)
    el.setAttribute('data-url', url)
    el.innerHTML =
      '<pre><code class="language-javascript hljs req"></code></pre><pre><code class="language-json hljs res">pending</code></pre>'
    root.appendChild(el)

    return async (config) => {
      el.querySelector('.req').innerHTML = highlight(
        `requete.${method}('${url}')`,
        'javascript'
      )

      const res = await invoke(url, config).catch((e) => e)
      el.querySelector('.res').innerHTML = highlightRes(res.ctx || res)

      return res
    }
  }

  // highlight.js render <code> elements when loaded
  document.addEventListener('DOMContentLoaded', (_) => {
    document.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightElement(el)
    })
  })
})(typeof globalThis !== 'undefined' ? globalThis : global || self)
