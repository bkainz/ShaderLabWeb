import React from 'react'
import Tabs from '../../Tabs'
import Shader from './Shader'
import Initializer from '../../Initializer'

export default Component.register(import.meta.url, ({className, id, props}) => {
  props.Shader = Shader.registerTemplate()
  return <form className={className} id={id}>
           <div className={className+'-Shaders'}>
             <Tabs tabs={[]}/>
           </div>
           <div className={className+'-Controls'}>
             <button className={className+'-CompileButton'}>Compile & Link</button>
           </div>
           <Initializer/>
         </form>
})