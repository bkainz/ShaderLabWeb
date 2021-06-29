import loginPage from '../../pages/session/login'

export async function authenticateUser(ctx, next) {
  if (!ctx.state.session.user) {
    ctx.state.session.referrer = ctx.request.url
    ctx.status = 403
    ctx.body = await loginPage({session: ctx.state.session})
    return
  }

  await next()
}

export async function authorizeRoot(ctx, next) {
  if (!ctx.state.session.user || !ctx.state.session.user.isRoot) {
    ctx.status = 404
    return
  }

  await next()
}