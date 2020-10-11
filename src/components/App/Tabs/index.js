import React from 'react'
import compReg from '../../../componentRegistry'

export default function(props) {
  const {className, id} = compReg.register(import.meta.url, props)

  return <div className={className} id={id}>
           {props.tabs.map((tab, idx) =>
             <input className={className+'-State'} id={id+'-State-'+idx} key={idx}
                    type="radio" form={id+'-State'} name={id+'-State-Tab'} value={tab.value} defaultChecked={idx === 0}/>)}
           <ul className={className+'-Tabs'}>
             {props.tabs.map((tab, idx) =>
               <li className={className+'-Tab'} key={idx}>
                 <label htmlFor={id+'-State-'+idx}>{tab.label}</label>
               </li>)}
           </ul>
           <ul className={className+'-Cards'}>
             {props.tabs.map((tab, idx) =>
               <li className={className+'-Card'} key={idx}>
                 {tab.content}
               </li>)}
           </ul>
         </div>
}