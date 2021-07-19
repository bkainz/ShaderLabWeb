import React from 'react'
import renderHTMLPage from '../../../_renderer/renderHTMLPage'
import escapeCSS from '../../../componentHelpers/escapeCSS'
import HeaderPage from '../../../components/HeaderPage'
import App from '../../../components/App'
import SavedAt from './SavedAt'
import Initializer from '../../../components/Initializer'

export default renderHTMLPage({
  meta: `<title>Projects | ShaderLabWeb</title>
         <meta name="robots" content="noindex, nofollow">`.replace(/\n {11}/, '\n'),
  Body: Component.register(import.meta.url, ({className, id, props}) =>
          <HeaderPage session={props.session}>
            <div className={className} id={id}>
              <form className={className+'-DeleteForm'} id={id+'-DeleteForm'} method="POST" action={`/projects/${props.project.id}/delete`}/>
              <form className={className+'-EditForm'} id={id+'-EditForm'} hx-put={'/projects/'+props.project.id} hx-target={'#'+escapeCSS(id)+'-SavedAtDate'}><button type="submit" disabled/></form>
              <div className={className+'-Properties'}>
                <div className={className+'-Name'}>
                  Name:&nbsp;<input type="text" className={className+'-NameValue'} form={id+'-EditForm'} name="name" size="1" defaultValue={props.project.name} placeholder={'Enter name…'} autoComplete="off"/>
                </div>
                <div className={className+'-SavedAt'}>
                  (last save:&nbsp;<span id={id+'-SavedAtDate'}><SavedAt datetime={props.project.savedAt}/></span>)
                </div>
                <button type="submit" form={id+'-DeleteForm'} className={className+'-DeleteButton'}>delete</button>
              </div>
              <div className={className+'-Project'}>
                <App form={id+'-EditForm'} state={props.project.state}/>
              </div>
              <Initializer/>
            </div>
          </HeaderPage>)
})