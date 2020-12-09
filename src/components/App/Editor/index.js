import React from 'react'
import compReg from '../../../componentRegistry'
import Tabs from '../Tabs'
import Shader from './Shader'

export default function(props) {
  const {className, id} = compReg.register(import.meta.url, props)

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
}