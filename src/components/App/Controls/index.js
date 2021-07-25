import React from 'react'
import Tabs from './Tabs'
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
    <div className={className+'-State'}>
      <div className={className+'-StateHeadline'}>Download State:</div>
      &nbsp;<button type="button" className={className+'-Button save-json'}>.json</button>
      &nbsp;<button type="button" className={className+'-Button save-zip'}>.zip</button>
      <div className={className+'-StateHeadline'}>Upload State:</div>
      &nbsp;<button type="button" className={className+'-Button load-json'}>.json</button>
      &nbsp;<button type="button" className={className+'-Button load-zip'}>.zip</button>
    </div>
    <Initializer/>
  </div>
)