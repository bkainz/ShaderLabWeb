import React from 'react'
import Logo from '../../Logo'

export default Component.register(import.meta.url, ({className, id, props}) =>
  <div className={className} id={id}>
    <div className={className+'-Logo'}>
      <Logo/>
    </div>
  </div>
)