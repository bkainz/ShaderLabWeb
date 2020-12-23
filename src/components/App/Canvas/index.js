import React from 'react'
import Initializer from '../../Initializer'

export default Component.register(import.meta.url, ({className, id}) =>
  <div className={className} id={id}>
    <canvas className={className+'-Canvas'}/>
    <Initializer/>
  </div>
)