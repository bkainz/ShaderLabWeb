import React from 'react'
import escapeCSS from '../../componentHelpers/escapeCSS'
import renderHTMLPage from '../../_renderer/renderHTMLPage'
import HeaderPage from '../../components/HeaderPage'
import Initializer from '../../components/Initializer'
import FlashMessage from '../../components/FlashMessage'

export default renderHTMLPage({
  meta: `<title>Account | ShaderLabWeb</title>
         <meta name="robots" content="noindex, nofollow">`.replace(/\n {11}/, '\n'),
  Body: Component.register(import.meta.url, ({className, id, props}) =>
          <HeaderPage session={props.session}>
            <div id={id} className={className}>
              <div className={className+'-Area'}>
                <h1 className={className+'-Headline'}>Your Account</h1>
                <div className={className+'-Content'}>
                  <form className={className+'-Form'} hx-put="/account" hx-target={'.'+escapeCSS(className+'-SaveMessage')}>
                    <div className={className+'-Section'}>
                      <div className={className+'-SectionHeading'}>Username</div>
                      <div className={className+'-SectionContent'}>
                        <div>{props.user.username}</div>
                      </div>
                    </div>
                    <div className={className+'-Section'}>
                      <div className={className+'-SectionHeading'}>Change password</div>
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
                    <div className={className+'-Save'}>
                      <button type="submit" className={className+'-SaveButton'}>save</button>
                      <div className={className+'-SaveMessage'}/>
                    </div>
                  </form>
                </div>
              </div>
              <Initializer/>
            </div>
          </HeaderPage>,
          [FlashMessage]
        )
})