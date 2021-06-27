import React from 'react'
import Tabs from '../../Tabs'
import Log from './Log'
import Camera from './Camera'
import Model from './Model'
import Uniforms from './Uniforms'
import Initializer from '../../Initializer'

export default Component.register(import.meta.url, ({className, id}) =>
  <div className={className} id={id}>
    <div className={className+'-Tabs'}>
      <Tabs tabs={[{id: 'log', label: 'Log', content: <Log/>},
                   {id: 'camera', label: 'Camera', content: <Camera/>},
                   {id: 'model', label: 'Model', content: <Model/>},
                   {id: 'uniforms', label: 'Uniforms', content: <Uniforms/>}]}/>
    </div>
    <div className={className+'-Controls'}>
      State:&nbsp;
      <button type="button" className={className+'-Button'} id={id+'-SaveButton'}>Save</button>&nbsp;
      <button type="button" className={className+'-Button'} id={id+'-LoadButton'}>Load</button>
    </div>
    <Initializer/>
  </div>
)