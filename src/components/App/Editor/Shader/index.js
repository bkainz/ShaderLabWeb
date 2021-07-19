import React from 'react'
import Initializer from '../../../Initializer'

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
    <Initializer/>
  </div>
)