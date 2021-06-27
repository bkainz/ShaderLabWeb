import React from 'react'

export default Component.register(import.meta.url, ({className, id}) =>
  <div className={className} id={id}>
    <h1 className={className+'-Title'}>ShaderLabWeb</h1>
    <div className={className+'-VerticalBar'}/>
    <img className={className+'-Logo'} src="/assets/logo.png"/>
  </div>
)