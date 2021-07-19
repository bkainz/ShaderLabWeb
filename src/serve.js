import path from 'path'
import http from 'http'
import Koa from 'koa'
import koaBody from 'koa-body'
import koaStatic from 'koa-static'
import App from './helpers/App'
import Model from './helpers/Model'
import User from './models/User'
import Session from './helpers/Session'
import appRoutes from './routes/app'
import sessionRoutes from './routes/session'
import accountRoutes from './routes/account'
import userRoutes from './routes/users'
import projectRoutes from './routes/projects'
import exitHandler from './helpers/exitHandler'

const app = new App()
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
koa.use(async (ctx, next) => {
  await User.exists({id: 1}).then(exists => exists || User.saveOne({id: 1, username: 'admin', password: 'password'}))
  ctx.state.session = await Session.fromCookie(ctx.cookies.get('session'))
  await next()
  ctx.cookies.set('session', await ctx.state.session.toCookie(), {sameSite: 'strict'})
})
koa.use(appRoutes(app))
koa.use(sessionRoutes(app))
koa.use(accountRoutes(app))
koa.use(userRoutes(app))
koa.use(projectRoutes(app))

Model.setup.isDone.then(() => {
  const server = http.createServer(koa.callback())

  const connections = new Set()
  server.on('connection', connection => {
    connections.add(connection)
    connection.on('close', _ => connections.delete(connection))
  })

  exitHandler.register('server', async () => {
    await Promise.all([...connections].map(connection => new Promise(resolve => connection.end(resolve))))
    await new Promise(resolve => server.close(resolve))
  }, {requires: 'database'})

  console.log('Listening for requests...')
  server.listen(process.env.PORT || 3000)
})