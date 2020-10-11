import React from 'react'
import compReg from '../../../componentRegistry'

export default function(props) {
  const {className, id} = compReg.register(import.meta.url, props)

  return <textarea className={className} id={id}/>
}