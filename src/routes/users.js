import Router from '@koa/router'
import {authenticateUser, authorizeRoot} from './middlewares/session'
import httpParams from '../helpers/httpParams'

import User from '../models/User'
import usersPage from '../pages/users'
import userPage from '../pages/users/user'

import Users from '../components/Users'
import FlashMessage from '../components/FlashMessage'
import renderHTMLFragment from '../_renderer/renderHTMLFragment'

export default function(app) {
  const router = new Router({prefix: '/users'})

  router.use(authenticateUser)
  router.use(authorizeRoot)

  router.get('users', '/', async ctx => {
    ctx.body = await usersPage({session: ctx.state.session})
  })

  router.get('/list', async ctx => {
    const where = httpParams.process(ctx.query)
    const items = await User.get(where)
    ctx.body = await renderHTMLFragment(Users)({items})
  })

  router.post('/', async ctx => {
    const [columns, noChanges] = User.augmentRecord(User.build({id: undefined}), httpParams.process(ctx.request.body))

    try {
      const id = await User.saveOne(columns)
      ctx.set('HX-REDIRECT', ctx.router.url('user', id))
      ctx.status = 204
    }
    catch (e) {
      console.error(e)
      ctx.body = await renderHTMLFragment(FlashMessage)({type: 'error', message: e.message})
    }
  })

  router.get('/new', async ctx => {
    const user = User.build()
    ctx.body = await userPage({session: ctx.state.session, user})
  })

  router.get('user', '/:id', async ctx => {
    const user = await User.getOne({id: Number(ctx.params.id)})

    if (user.id) {
      ctx.body = await userPage({session: ctx.state.session, user})
    }
    else {
      ctx.status = 404
    }
  })

  router.put('/:id', async ctx => {
    const user = await User.getOne({id: Number(ctx.params.id)})

    if (!user.id) {
      ctx.status = 404
      return
    }

    const [columns, noChanges] = User.augmentRecord(user, httpParams.process(ctx.request.body))

    if (noChanges) {
      ctx.body = await renderHTMLFragment(FlashMessage)({type: 'success', message: 'Nothing changed.'})
      return
    }

    try {
      await User.saveOne(columns)
      ctx.body = await renderHTMLFragment(FlashMessage)({type: 'success', message: 'Saved!'})
    }
    catch (e) {
      console.error(e)
      ctx.body = await renderHTMLFragment(FlashMessage)({type: 'error', message: e.message})
    }
  })

  router.post('/:id/delete', async ctx => {
    await User.delete({id: Number(ctx.params.id)})
    ctx.redirect(ctx.router.url('users'))
  })

  return router.routes()
}