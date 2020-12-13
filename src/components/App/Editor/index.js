import React from 'react'
import Tabs from '../Tabs'
import Shader from './Shader'

export default Component.register(import.meta.url, ({className, id, props}) => {
  props.shaderTemplateId = Shader.registerTemplate()
  return <form className={className} id={id}>
           <div className={className+'-Shaders'}>
             <Tabs tabs={props.passes.flatMap(passKey => {
               return 'vertex fragment'.split(' ').map(shaderType => {
                 const label = (passKey === 'base' ? '' : passKey+' ')+shaderType[0].toUpperCase()+shaderType.slice(1)+' Shader'
                 return {label, content: <Shader pass={passKey} type={shaderType} name={label}/>}
               })
             })}/>
           </div>
           <div className={className+'-Controls'}>
             <button className={className+'-CompileButton'}>Compile & Link</button>
           </div>
         </form>
})