import React from 'react'
import compReg from '../../../componentRegistry'
import Tabs from '../Tabs'
import Shader from './Shader'

export default function(props) {
  const {className, id} = compReg.register(import.meta.url, props)

  return <form className={className} id={id}>
           <div className={className+'-Shaders'}>
             <Tabs tabs={props.shaders.map(shader => {
               return {label: shader.name, content: <Shader shader={shader}/>}
             })}/>
           </div>
           <div className={className+'-Controls'}>
             <button className={className+'-CompileButton'}>Compile & Link</button>
           </div>
         </form>
}