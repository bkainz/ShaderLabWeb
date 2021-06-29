import React from 'react'
import renderHTMLPage from '../../../_renderer/renderHTMLPage'
import Page from '../../../components/Page'
import Logo from '../../../components/Logo'

export default renderHTMLPage({
  meta: `<title>ShaderLabWeb</title>
         <meta name="robots" content="noindex, nofollow">`.replace(/\n {11}/, '\n'),
  Body: Component.register(import.meta.url, ({className, id, props}) =>
          <Page>
            <div className={className} id={id}>
              <div className={className+'-Logo'}>
                <Logo/>
              </div>
              <div className={className+'-Area'}>
                {props.session.message && <div className={className+'-Message'}>{props.session.digestMessage()}</div>}
                <form method="POST" action="/session" className={className+'-LogInForm'}>
                  <input type="text" name="username" placeholder="Username" className={className+'-Input'}/>
                  <input type="password" name="password" placeholder="Password" className={className+'-Input'}/>
                  <button className={className+'-LogInButton'}>Log In</button>
                </form>
              </div>
            </div>
          </Page>
        )
})