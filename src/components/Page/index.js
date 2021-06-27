import React from 'react'

export default Component.register(import.meta.url, ({className, id, props}) =>
  <div className={className} id={id}>
    {props.children}
  </div>
)