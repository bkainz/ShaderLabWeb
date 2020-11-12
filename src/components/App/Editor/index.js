import React from 'react'
import compReg from '../../../componentRegistry'
import Tabs from '../Tabs'
import Shader from './Shader'

export default function(props) {
  const {className, id} = compReg.register(import.meta.url, props)

  return <form className={className} id={id}>
           <div className={className+'-Shaders'}>
             <Tabs tabs={Object.keys(props.passes).flatMap(passKey => {
               return Object.keys(props.passes[passKey].shaders).map(shaderKey => {
                 const shader = props.passes[passKey].shaders[shaderKey]
                 return {label: shader.name, content: <Shader pass={passKey} type={shaderKey} name={shader.name} default={shader.default}/>}
               })
             })}/>
           </div>
           <div className={className+'-Controls'}>
             <button className={className+'-CompileButton'}>Compile & Link</button>
           </div>
         </form>
}