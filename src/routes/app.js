import Router from '@koa/router'

import appPage from '../pages/app'

export default function(app) {
  const router = new Router()

  router.get('/', async ctx => {
    ctx.body = await appPage({session: ctx.state.session})
  })

  return router.routes()
}