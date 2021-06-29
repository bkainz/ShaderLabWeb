import React from 'react'
import Logo from '../../Logo'

export default Component.register(import.meta.url, ({className, id, props}) =>
  <div className={className} id={id}>
    <div className={className+'-Logo'}>
      <Logo/>
    </div>
    <div className={className+'-Account'}>
      {props.session.message && <div className={className+'-Message'}>{props.session.digestMessage()}</div>}
      {props.session.user
        ? <div>
            <div className={className+'-AccountUsername'}>{props.session.user.username}</div>
            {props.session.user.isRoot
              ? <div className={className+'-AdminNavigation'}>
                  Administration: <ul className={className+'-Navigation'}>
                    <li className={className+'-NavigationItem'}>
                      <a href="/users">users</a>
                    </li>
                  </ul>
                </div>
              : ''}
            <div className={className+'-UserNavigation'}>
              <ul className={className+'-Navigation'}>
                <li className={className+'-NavigationItem'}>
                  <a href="/account">account</a>
                </li>
                <li className={className+'-NavigationItem'}>
                  <form method="POST" action="/session/delete">
                    <button className={className+'-LogOutButton'}>log out</button>
                  </form>
                </li>
              </ul>
            </div>
          </div>
        : <a href="/account">log in</a>}
      </div>
  </div>
)