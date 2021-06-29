import React from 'react'
import escapeCSS from '../../../componentHelpers/escapeCSS'
import renderHTMLPage from '../../../_renderer/renderHTMLPage'
import HeaderPage from '../../../components/HeaderPage'
import FlashMessage from '../../../components/FlashMessage'
import Initializer from '../../../components/Initializer'

export default renderHTMLPage({
  meta: `<title>Users | ShaderLabWeb</title>
         <meta name="robots" content="noindex, nofollow">`.replace(/\n {11}/, '\n'),
  Body: Component.register(import.meta.url, ({className, id, props}) =>
          <HeaderPage session={props.session}>
            <div className={className} id={id}>
              <div className={className+'-Area'}>
                <h1 className={className+'-Headline'}>{props.user.id ? 'Edit user' : 'Create user'}</h1>
                <div className={className+'-Content'}>
                  <form className={className+'-EditForm'} autoComplete="off"
                        hx-post={props.user.id ? undefined : '/users'}
                        hx-put={props.user.id ? '/users/'+props.user.id : undefined}
                        hx-target={'.'+escapeCSS(className+'-SaveMessage')}>
                    {props.user.id
                      ? <div className={className+'-Section'}>
                          <div className={className+'-SectionHeading'}>Id: {props.user.id || 'new'}</div>
                        </div>
                      : ''}
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
                      <button type="submit" className={className+'-Button save'}>save</button>
                      <div className={className+'-SaveMessage'}/>
                    </div>
                  </form>
                  {props.user.id && <form className={className+'-Delete'} method="POST" action={`/users/${props.user.id}/delete`}>
                    <button type="submit" className={className+'-Button delete'}>delete</button>
                  </form>}
                  <Initializer/>
                </div>
              </div>
            </div>
          </HeaderPage>,
  [FlashMessage])
})