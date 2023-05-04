window.printRes = (res) => {
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
          if (value) {
            plainValue = {}
            value.forEach((value, key) => {
              plainValue[key] = value
            })
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

  const code = JSON.stringify(plainObject(res), null, 2)
  return Prism.highlight(code, Prism.languages.json, 'json')
}
