import React from 'react'
import renderHTMLPage from '../../_renderer/renderHTMLPage'
import HeaderPage from '../../components/HeaderPage'
import List from '../../components/List'
import Projects from '../../components/Projects'

export default renderHTMLPage({
  meta: `<title>Projects | ShaderLabWeb</title>
         <meta name="robots" content="noindex, nofollow">`.replace(/\n {11}/, '\n'),
  Body: Component.register(import.meta.url, ({className, id, props}) =>
          <HeaderPage session={props.session}>
            <div className={className} id={id}>
              <div className={className+'-Area'}>
                <h2 className={className+'-Headline'}>Projects</h2>
                <div className={className+'-Content'}>
                  <form hx-post="/projects">
                    <button className={className+'-CreateButton'}>Create</button>
                  </form>
                  <section className={className+'-List'}>
                    <List resource="projects" filters={[]} state={[]}/>
                  </section>
                </div>
              </div>
            </div>
          </HeaderPage>,
        [Projects])
})