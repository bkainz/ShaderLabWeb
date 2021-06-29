import Router from '@koa/router'
import {authenticateUser} from './middlewares/session'

export default function() {
  const router = new Router({prefix: '/session'})

  router.post('/', async ctx => {
    const {username, password} = ctx.request.body

    if (!await ctx.state.session.authenticateAndSetUser(username, password))
      ctx.state.session.message = 'Unknown username or invalid password'

    ctx.redirect(ctx.state.session.referrer)
  })

  router.post('/delete', authenticateUser, async ctx => {
    await ctx.state.session.unsetUser('Successfully logged out')
    ctx.redirect(ctx.state.session.referrer)
  })

  return router.routes()
}