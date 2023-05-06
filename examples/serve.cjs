const mount = require('koa-mount')
const serve = require('koa-static')
const Koa = require('koa')

const app = new Koa()

app.use(mount('/requete', serve('dist')))
app.use(serve('examples'))

app.listen(3000)

console.log('Serving on http://localhost:3000\n')
