import Router from '@koa/router'
import httpParams from '../../helpers/httpParams'

import Project from '../../models/Project'

import Projects from '../../components/Projects'
import projectPage from '../../pages/projects/project'
import SavedAt from '../../pages/projects/project/SavedAt'
import renderHTMLFragment from '../../_renderer/renderHTMLFragment'

export default function(app) {
  const router = new Router({prefix: '/:user_id/projects'})

  router.get('userProjects', '/', async ctx => {
    const items = await Project.get({user_id: Number(ctx.params.user_id)})
    ctx.body = await renderHTMLFragment(Projects)({items, resourceURI: ctx.router.url('userProjects', ctx.params.user_id)})
  })

  router.post('/', async ctx => {
    const project = Project.build({id: undefined, user_id: Number(ctx.params.user_id)})
    const id = await Project.saveOne(project)
    ctx.set('HX-REDIRECT', '/projects/'+id)
    ctx.status = 204
  })

  router.get('/:id', async ctx => {
    const project = await Project.getOne({id: Number(ctx.params.id), user_id: Number(ctx.params.user_id)})

    if (!project.id) {
      ctx.status = 404
      return
    }

    ctx.body = await projectPage({session: ctx.state.session, project, resourceURI: ctx.router.url('userProjects', ctx.params.user_id)})
  })

  router.put('/:id', async ctx => {
    const project = await Project.getOne({id: Number(ctx.params.id), user_id: Number(ctx.params.user_id)})

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
    const project = await Project.getOne({id: Number(ctx.params.id), user_id: Number(ctx.params.user_id)})

    if (!project.id) {
      ctx.status = 404
      return
    }

    await Project.delete({id: Number(ctx.params.id)})
    ctx.redirect('/projects')
  })

  return router.routes()
}