import React from 'react'

export default Component.register(import.meta.url, ({className, id, props}) =>
  <span className={className+(props.flash ? ' flash' : '')}>{props.datetime.toLocaleString('en-GB', {timeZone: 'Europe/London'})}</span>
)