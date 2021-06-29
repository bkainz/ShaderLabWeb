import Router from '@koa/router'
import {authenticateUser} from './middlewares/session'
import User from '../models/User'

import httpParams from '../helpers/httpParams'
import renderHTMLFragment from '../_renderer/renderHTMLFragment'
import FlashMessage from '../components/FlashMessage'
import accountPage from '../pages/account'

export default function() {
  const router = new Router({prefix: '/account'})

  router.use(authenticateUser)

  router.get('/', async ctx => {
    ctx.body = await accountPage({session: ctx.state.session, user: ctx.state.session.user})
  })

  router.put('/', async ctx => {
    const [columns, noChanges] = User.augmentRecord(ctx.state.session.user, httpParams.process(ctx.request.body))

    if (noChanges) {
      ctx.body = await renderHTMLFragment(FlashMessage)({type: 'success', message: 'Nothing changed.'})
      return
    }

    for (const column in ctx.state.session.user)
      columns[column] = columns[column] || ctx.state.session.user[column]

    try {
      await User.saveOne(columns)
      ctx.body = await renderHTMLFragment(FlashMessage)({type: 'success', message: 'Saved!'})
    }
    catch (e) {
      console.error(e)
      ctx.body = await renderHTMLFragment(FlashMessage)({type: 'error', message: e.message})
    }
  })

  return router.routes()
}