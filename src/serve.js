import url from 'url'
import path from 'path'
import http from 'http'
import Koa from 'koa'
import Router from '@koa/router'
import koaBody from 'koa-body'
import koaStatic from 'koa-static'

global.rootDir = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)))

const koa = new Koa()

/*
 * Parse POST bodies
 */
koa.use(koaBody({multipart: true}))

/*
 * Serve static files
 */
koa.use(koaStatic(path.join(global.rootDir, 'public')))

/*
 * Serve Frontend
 */

const frontend = new Router()

import appPage from './pages/app'
frontend.get('/', async ctx => {
  ctx.body = await appPage()
})

koa.use(frontend.routes())


const server = http.createServer(koa.callback())

const connections = new Set()
server.on('connection', connection => {
  connections.add(connection)
  connection.on('close', _ => connections.delete(connection))
})

'SIGINT SIGTERM'.split(' ').forEach(signal => {
  process.on(signal, async () => {
    await Promise.all([...connections].map(connection => new Promise(resolve => connection.end(resolve))))
    await new Promise(resolve => server.close(resolve))
  })
})

console.log('Listening for requests...')
server.listen(process.env.PORT || 3000)