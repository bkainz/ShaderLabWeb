import React from 'react'

export default Component.register(import.meta.url, ({className, id}) =>
  <div className={className} id={id}>
    <div className={className+'-Source'}/>
    <div className={className+'-Controls'}>
      <label>
        <input className={className+'-isLinked'} type="checkbox" defaultChecked={true}/> Link to program
      </label>
    </div>
  </div>
)