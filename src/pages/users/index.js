import React from 'react'
import renderHTMLPage from '../../_renderer/renderHTMLPage'
import HeaderPage from '../../components/HeaderPage'
import List from '../../components/List'
import Users from '../../components/Users'

export default renderHTMLPage({
  meta: `<title>Users | ShaderLabWeb</title>
         <meta name="robots" content="noindex, nofollow">`.replace(/\n {11}/, '\n'),
  Body: Component.register(import.meta.url, ({className, id, props}) =>
          <HeaderPage session={props.session}>
            <div className={className} id={id}>
              <div className={className+'-Area'}>
                <h2 className={className+'-Headline'}>Users</h2>
                <div className={className+'-Content'}>
                  <section>
                    <a href={`/users/new`} className={className+'-AddButton'}>Add</a>
                  </section>
                  <section className={className+'-List'}>
                    <List resourceURI="/users" filters={[]} state={[]}/>
                  </section>
                </div>
              </div>
            </div>
          </HeaderPage>,
        [Users])
})