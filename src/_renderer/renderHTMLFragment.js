import React from 'react'
import ReactDomServer from 'react-dom/server'
import './Component'
import ComponentRegistry from './ComponentRegistry'

export default function(Content) {
  return async function(props = {}) {
    global.componentRegistry = new ComponentRegistry()
    return ReactDomServer.renderToStaticMarkup(<Content {...props}/>)
  }
}