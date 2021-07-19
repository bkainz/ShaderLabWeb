import React from 'react'
import escapeCSS from '../../../componentHelpers/escapeCSS'
import renderHTMLPage from '../../../_renderer/renderHTMLPage'
import HeaderPage from '../../../components/HeaderPage'
import List from '../../../components/List'
import FlashMessage from '../../../components/FlashMessage'
import Projects from '../../../components/Projects'
import Initializer from '../../../components/Initializer'

export default renderHTMLPage({
  meta: `<title>Users | ShaderLabWeb</title>
         <meta name="robots" content="noindex, nofollow">`.replace(/\n {11}/, '\n'),
  Body: Component.register(import.meta.url, ({className, id, props}) =>
          <HeaderPage session={props.session}>
            <div className={className} id={id}>
              <div className={className+'-Area'}>
                <h2 className={className+'-Headline'}>{props.user.id ? `Edit User (id: ${props.user.id})` : 'Create User'}</h2>
                <div className={className+'-Content'}>
                  <form className={className+'-EditForm'} autoComplete="off"
                        hx-post={props.user.id ? undefined : '/users'}
                        hx-put={props.user.id ? '/users/'+props.user.id : undefined}
                        hx-target={'.'+escapeCSS(className+'-SaveMessage')}>
                    <div className={className+'-Section'}>
                      <div className={className+'-SectionHeading'}>Username</div>
                      <div className={className+'-SectionContent'}>
                        <input type="text" className={className+'-Input'} name="username" size="1" defaultValue={props.user.username} placeholder={'Enter username…'} required/>
                      </div>
                    </div>
                    <div className={className+'-Section'}>
                      <div className={className+'-SectionHeading'}>{props.user.id ? 'Change password' : 'Password'}</div>
                      <div className={className+'-SectionContent'}>
                        <div className={className+'-PasswordDiv'}>
                          <input type="password" className={className+'-Input '+className+'-Password'} name="password" size="1" defaultValue={props.user.password} placeholder={'Enter password…'} required={props.user.id === null}/>
                          <div className={className+'-ShowPasswordDiv'}>
                            <input type="checkbox" id={id+'-ShowPassword'} className={className+'-ShowPassword'}/>&nbsp;<label htmlFor={id+'-ShowPassword'}>show</label>
                          </div>
                        </div>
                        <p className={className+'-InputDescription'}>All passwords are allowed regardless of length or characters used. Choose a password you find secure.</p>
                      </div>
                    </div>
                    <div className={className+'-Section '+className+'-Save'}>
                      <div className={className+'-SaveMessage'}/>
                      <button type="submit" className={className+'-Button save'}>save</button>
                    </div>
                  </form>
                  {props.user.id && <>
                    <div className={className+'-Projects'}>
                      <h2 className={className+'-Headline'}>User Projects</h2>
                      <div className={className+'-SectionContent'}>
                        <section className={className+'-List'}>
                          <List resourceURI={'/users/'+props.user.id+'/projects'} filters={[]} state={[]}/>
                        </section>
                      </div>
                    </div>
                    <form className={className+'-Delete'} method="POST" action={`/users/${props.user.id}/delete`}>
                      <h2 className={className+'-Headline'}>Delete User</h2>
                      <button type="submit" className={className+'-Button delete'}>delete</button>
                    </form>
                  </>}
                  <Initializer/>
                </div>
              </div>
            </div>
          </HeaderPage>,
  [FlashMessage, Projects])
})