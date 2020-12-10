import React from 'react'
import compReg from '../../../componentRegistry'

export default function(props) {
  const {className, id} = compReg.register(import.meta.url, props)

  return <div className={className} id={id}>
           {props.tabs.map((tab, idx) =>
             <input className={className+'-State'} id={id+'-State-'+tab.label} key={tab.label}
                    type="radio" form={id+'-State'} name={id+'-State-Tab'} value={tab.label} defaultChecked={idx === 0}/>)}
           <ul className={className+'-Tabs'}>
             {props.tabs.map(tab =>
               <li className={className+'-Tab'} key={tab.label}>
                 <label htmlFor={id+'-State-'+tab.label}>{tab.label}</label>
               </li>)}
           </ul>
           <ul className={className+'-Cards'}>
             {props.tabs.map(tab =>
               <li className={className+'-Card'} key={tab.label}>
                 {tab.content}
               </li>)}
           </ul>
         </div>
}