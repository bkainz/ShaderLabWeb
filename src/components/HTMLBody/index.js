import React from 'react'

export default Component.register(import.meta.url, ({className, id, props}) =>
  <body className={className} id={id}>
    {props.children}
  </body>
)