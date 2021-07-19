import Router from '@koa/router'
import {authenticateUser} from './middlewares/session'
import httpParams from '../helpers/httpParams'

import User from '../models/User'
import Project from '../models/Project'
import projectsPage from '../pages/projects'
import projectPage from '../pages/projects/project'
import SavedAt from '../pages/projects/project/SavedAt'

import Projects from '../components/Projects'
import renderHTMLFragment from '../_renderer/renderHTMLFragment'

export default function(app, {prefix}) {
  const router = new Router({prefix})

  router.use(authenticateUser)

  router.get(prefix, '/', async ctx => {
    ctx.body = await projectsPage({session: ctx.state.session, resourceURI: ctx.router.url(prefix, ctx.params)})
  })

  router.get('/list', async ctx => {
    const items = await Project.get({...httpParams.process(ctx.query), user_id: ctx.params.user_id || ctx.state.session.user.id})
    ctx.body = await renderHTMLFragment(Projects)({items, resourceURI: ctx.router.url(prefix, ctx.params)})
  })

  router.post('/', async ctx => {
    const project = Project.build({id: undefined, user_id: ctx.params.user_id || ctx.state.session.user.id})
    const id = await Project.saveOne(project)
    ctx.set('HX-REDIRECT', prefix+'/'+id)
    ctx.status = 204
  })

  router.get('/:id', async ctx => {
    const project = await Project.getOne({id: Number(ctx.params.id), user_id: ctx.params.user_id || ctx.state.session.user.id})

    if (!project.id) {
      ctx.status = 404
      return
    }

    const user = ctx.params.user_id ? await User.getOne({id: ctx.params.user_id}) : ctx.state.session.user

    ctx.body = await projectPage({session: ctx.state.session, project, user, resourceURI: ctx.router.url(prefix, ctx.params)})
  })

  router.put('/:id', async ctx => {
    const project = await Project.getOne({id: Number(ctx.params.id), user_id: ctx.params.user_id || ctx.state.session.user.id})

    if (!project.id) {
      ctx.status = 404
      return
    }

    const [columns, noChanges] = Project.augmentRecord(project, httpParams.process(ctx.request.body))

    if (noChanges) {
      ctx.body = await renderHTMLFragment(SavedAt)({datetime: columns.savedAt})
      return
    }

    await Project.saveOne(columns)

    ctx.body = await renderHTMLFragment(SavedAt)({datetime: columns.savedAt, flash: true})
  })

  router.post('/:id/delete', async ctx => {
    const project = await Project.getOne({id: Number(ctx.params.id), user_id: ctx.params.user_id || ctx.state.session.user.id})

    if (!project.id) {
      ctx.status = 404
      return
    }

    await Project.delete({id: Number(ctx.params.id)})
    ctx.redirect(ctx.router.url(prefix, ctx.params))
  })

  return router.routes()
}