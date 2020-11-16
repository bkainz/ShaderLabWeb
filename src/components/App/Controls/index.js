import React from 'react'
import compReg from '../../../componentRegistry'
import Tabs from '../Tabs'
import Log from './Log'
import Camera from './Camera'
import Model from './Model'
import Uniforms from './Uniforms'

export default function(props) {
  const {className, id} = compReg.register(import.meta.url, props)

  return <div className={className} id={id}>
           <Tabs tabs={[{label: 'Log', content: <Log/>},
                        {label: 'Camera', content: <Camera/>},
                        {label: 'Model', content: <Model/>},
                        {label: 'Uniforms', content: <Uniforms/>}]}/>
         </div>
}