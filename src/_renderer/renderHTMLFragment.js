import React from 'react'
import ReactDomServer from 'react-dom/server'

export default function(Content) {
  return async function(props = {}) {
    return ReactDomServer.renderToStaticMarkup(<Content {...props}/>)
  }
}