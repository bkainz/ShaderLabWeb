import React from 'react'

export default Component.register(import.meta.url, ({className, id}) =>
  <div className={className} id={id}>
    <h1 className={className+'-Title'}>ShaderLabWeb</h1>
    <div className={className+'-VerticalBar'}/>
    <img className={className+'-Logo'} src="/assets/logo_white.svg"/>
    <p style={{marginLeft: '0.3em'}}><img className={className+'-Logo'} src="/assets/logo_tum.png"/></p>
  </div>
)