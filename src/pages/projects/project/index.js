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
              <form className={className+'-DeleteForm'} id={id+'-DeleteForm'} method="POST" action={`${props.resourceURI}/${props.project.id}/delete`}/>
              <form className={className+'-EditForm'} id={id+'-EditForm'} hx-put={`${props.resourceURI}/${props.project.id}`} hx-target={'#'+escapeCSS(id)+'-SavedAtDate'}/>
              <div className={className+'-Properties'}>
                <div className={className+'-Name'}>
                  Name:&nbsp;<input type="text" className={className+'-NameValue'} form={id+'-EditForm'} name="name" size="1" defaultValue={props.project.name} placeholder={'Enter name…'} autoComplete="off"/>
                </div>
                <div className={className+'-SavedAt'}>
                  saved at&nbsp;<span id={id+'-SavedAtDate'}><SavedAt datetime={props.project.savedAt}/></span>
                </div>
                {props.session.user.id !== props.user.id
                  ? <div className={className+'-Actions'}>
                      on behalf of {props.user.username}:
                      &nbsp;<button type="submit" form={id+'-EditForm'} className={className+'-Button'}>save</button>
                      &nbsp;<button type="submit" form={id+'-DeleteForm'} className={className+'-Button'}>delete</button>
                    </div>
                  : <div className={className+'-Actions'}>
                      <button type="submit" form={id+'-EditForm'} disabled/>
                      <button type="submit" form={id+'-DeleteForm'} className={className+'-Button'}>delete</button>
                    </div>}
              </div>
              <div className={className+'-Project'}>
                <App form={id+'-EditForm'} state={props.project.state}/>
              </div>
              <Initializer/>
            </div>
          </HeaderPage>)
})