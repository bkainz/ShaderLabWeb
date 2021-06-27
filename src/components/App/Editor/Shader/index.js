import React from 'react'

export default Component.register(import.meta.url, ({className, id}) =>
  <div className={className} id={id}>
    <div className={className+'-SourceSize'}>
      <div className={className+'-Source'}/>
    </div>
    <div className={className+'-Controls'}>
      <label>
        <input className={className+'-isLinked'} type="checkbox" defaultChecked={true}/> Link to program
      </label>
    </div>
  </div>
)