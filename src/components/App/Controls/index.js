import React from 'react'
import Tabs from '../Tabs'
import Log from './Log'
import Camera from './Camera'
import Model from './Model'
import Uniforms from './Uniforms'

export default Component.register(import.meta.url, ({className, id}) =>
  <div className={className} id={id}>
    <Tabs tabs={[{label: 'Log', content: <Log/>},
                 {label: 'Camera', content: <Camera/>},
                 {label: 'Model', content: <Model/>},
                 {label: 'Uniforms', content: <Uniforms/>}]}/>
  </div>
)