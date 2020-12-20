import React from 'react'

export default Component.register(import.meta.url, ({className, id, props}) =>
  <div className={className} id={id}>
    {props.tabs.map((tab, idx) =>
      <input type="radio" form={id+'-State'} name={id+'-State-Tab'} defaultChecked={idx === 0}
             className={className+'-State'} id={id+'-State-'+tab.id} value={tab.id} key={tab.label}/>)}
    <ul className={className+'-Tabs'}>
      {props.tabs.map(tab =>
        <li className={className+'-Tab'} id={id+'-Tab-'+tab.id} key={tab.label}>
          <label htmlFor={id+'-State-'+tab.id}>{tab.label}</label>
        </li>)}
    </ul>
    <ul className={className+'-Cards'}>
      {props.tabs.map(tab =>
        <li className={className+'-Card'} id={id+'-Card-'+tab.id} key={tab.label}>
          {tab.content}
        </li>)}
    </ul>
  </div>
)