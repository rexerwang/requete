const fs = require('fs')
const path = require('path')

const dist = (file) => path.join(__dirname, '../../dist/dist', file)

module.exports = (req, res, next) => {
  if (!/\/requete\/.+\.(js|mjs|cjs|ts|map)$/.test(req.url)) return next()

  const file = dist(req.url.split('/requete/').at(-1))
  const contentType = /\.map$/.test(file)
    ? 'application/json'
    : 'application/javascript'

  fs.createReadStream(file)
    .on('open', () => res.status(200).set('Content-Type', contentType))
    .on('end', () => res.end())
    .on('error', (e) => res.status(404).send(e.message))
    .pipe(res)
}
