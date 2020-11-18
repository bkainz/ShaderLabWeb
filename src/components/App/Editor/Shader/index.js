import React from 'react'
import compReg from '../../../../componentRegistry'

export default function(props) {
  const {className, id} = compReg.register(import.meta.url, props)
  const shaderId = [props.pass, props.type].filter(Boolean).join('/')

  return <div className={className} id={id}>
           <div className={className+'-Source'} name={shaderId+'-source'}/>
           <div className={className+'-Controls'}>
             <label>
               <input className={className+'-isLinked'} type="checkbox" name={shaderId+'-isLinked'} defaultChecked={true}/> Link to program
             </label>
           </div>
         </div>
}