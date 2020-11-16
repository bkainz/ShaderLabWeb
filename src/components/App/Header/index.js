import React from 'react'
import compReg from '../../../componentRegistry'

export default function(props) {
  const {className, id} = compReg.register(import.meta.url, props)

  return <div className={className} id={id}>
           <h1 className={className+'-Title'}>ShaderLabWeb</h1>
         </div>
}