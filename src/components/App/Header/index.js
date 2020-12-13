import React from 'react'

export default Component.register(import.meta.url, ({className, id}) =>
  <div className={className} id={id}>
    <div className={className+'-Left'}>
      <h1 className={className+'-Title'}>ShaderLabWeb</h1>
      <div className={className+'-Controls'}>
        <button type="button" className={className+'-Button'} id={id+'-SaveButton'}>Save State</button>
        <button type="button" className={className+'-Button'} id={id+'-LoadButton'}>Load State</button>
      </div>
    </div>
    <div className={className+'-Right'}>
      <img className={className+'-Logo'} src="assets/logo.png"/>
    </div>
  </div>
)