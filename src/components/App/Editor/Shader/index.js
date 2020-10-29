import React from 'react'
import compReg from '../../../../componentRegistry'

export default function(props) {
  const {className, id} = compReg.register(import.meta.url, props)
  const shaderId = [props.pass, props.type].filter(Boolean).join('/')

  return <div className={className} id={id}>
           <textarea className={className+'-Input'} name={shaderId+'-source'} defaultValue={props.default}/>
           <div className={className+'-Controls'}>
             <label>
               <input type="checkbox" name={shaderId+'-linked'} defaultChecked={true}/> Link to program
             </label>
           </div>
         </div>
}