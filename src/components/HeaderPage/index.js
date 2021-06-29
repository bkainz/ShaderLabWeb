import React from 'react'
import Page from '../Page'
import Header from './Header'

export default Component.register(import.meta.url, ({className, id, props}) =>
  <Page>
    <div className={className} id={id}>
      <header className={className+'-Header'}>
        <Header session={props.session}/>
      </header>
      <div className={className+'-Content'}>
        <div className={className+'-ContentArea'}>
          {props.children}
        </div>
      </div>
    </div>
  </Page>
)