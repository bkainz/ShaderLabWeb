#!/usr/bin/env node

import fs from 'fs'
import http from 'http'
import koaRouter from '@koa/router'
import exitHandler from '../src/helpers/exitHandler.js'

const Koa = require('koa');
const app = new Koa()
const router = new koaRouter()
const koaBody = require('koa-body').default;

router.post('/', koaBody({multipart: true}), async ctx => {
  const state = JSON.parse(ctx.request.body.state || '{}')
  const screenshot = ctx.request.files.screenshot

  const screenshotBase64 = await fs.promises.readFile(screenshot.path, 'base64')

  ctx.body = `<pre>${JSON.stringify(state, null, 2)}</pre>
              <img src="data:image/png;base64,${screenshotBase64}" style="max-height: 15em; max-width: 100%;">`
})

app.use(router.routes())


/*
 * Start server and set up graceful shutdown
 */
const server = http.createServer(app.callback())

const connections = new Set()
server.on('connection', connection => {
  connections.add(connection)
  connection.on('close', _ => connections.delete(connection))
})

exitHandler.register('server', async () => {
  await Promise.all([...connections].map(connection => new Promise(resolve => connection.end(resolve))))
  await new Promise(resolve => server.close(resolve))
})

server.listen(process.env.PORT || 3001)

console.log('Listening for requests...')