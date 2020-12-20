import React from 'react'
import Tabs from '../Tabs'
import Log from './Log'
import Camera from './Camera'
import Model from './Model'
import Uniforms from './Uniforms'

export default Component.register(import.meta.url, ({className, id}) =>
  <div className={className} id={id}>
    <Tabs tabs={[{id: 'log', label: 'Log', content: <Log/>},
                 {id: 'camera', label: 'Camera', content: <Camera/>},
                 {id: 'model', label: 'Model', content: <Model/>},
                 {id: 'uniforms', label: 'Uniforms', content: <Uniforms/>}]}/>
  </div>
)