import Router from '@koa/router'
import {authenticateUser} from './middlewares/session'
import httpParams from '../helpers/httpParams'

import Project from '../models/Project'
import projectsPage from '../pages/projects'
import projectPage from '../pages/projects/project'
import SavedAt from '../pages/projects/project/SavedAt'

import Projects from '../components/Projects'
import renderHTMLFragment from '../_renderer/renderHTMLFragment'

export default function(app) {
  const router = new Router({prefix: '/projects'})

  router.use(authenticateUser)

  router.get('/', async ctx => {
    ctx.body = await projectsPage({session: ctx.state.session})
  })

  router.get('/list', async ctx => {
    const where = httpParams.process(ctx.query)
    where.user_id = ctx.state.session.user.id
    const items = await Project.get(where)
    ctx.body = await renderHTMLFragment(Projects)({items})
  })

  router.post('/', async ctx => {
    const project = Project.build({id: undefined, user_id: ctx.state.session.user.id})
    const id = await Project.saveOne(project)
    ctx.set('HX-REDIRECT', '/projects/'+id)
    ctx.status = 204
  })

  router.get('/:id', async ctx => {
    const project = await Project.getOne({id: Number(ctx.params.id), user_id: ctx.state.session.user.id})

    if (!project.id || project.user_id !== ctx.state.session.user.id && !ctx.state.session.user.isRoot) {
      ctx.status = 404
      return
    }

    ctx.body = await projectPage({session: ctx.state.session, project})
  })

  router.put('/:id', async ctx => {
    const project = await Project.getOne({id: Number(ctx.params.id)})

    if (!project.id || project.user_id !== ctx.state.session.user.id && !ctx.state.session.user.isRoot) {
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
    await Project.delete({id: Number(ctx.params.id)})
    ctx.redirect('/projects')
  })

  return router.routes()
}