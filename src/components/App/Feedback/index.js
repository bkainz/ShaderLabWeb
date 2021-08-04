import React from 'react'
import Initializer from '../../Initializer'

export default Component.register(import.meta.url, ({className, id}) =>
  <form className={className} id={id}>
    <button className={className+'-Button'}>Get Feedback</button>
    <Initializer/>
  </form>
)