import React from 'react'
import ReactDomServer from 'react-dom/server'
import './Component'
import ComponentRegistry from './ComponentRegistry'
import HTMLBody from '../components/HTMLBody'

export default function({meta, Body}) {
  global.componentRegistry = new ComponentRegistry()
  const body = ReactDomServer.renderToStaticMarkup(<HTMLBody><Body/></HTMLBody>)
  const css = global.componentRegistry.toStyle()
  const js = global.componentRegistry.toScript()

  return `
    <!DOCTYPE html>
    <html lang="en-US">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <meta name="viewport" content="initial-scale=1.0, width=device-width">
        <meta name="referrer" content="unsafe-url">

        ${meta.replace(/\n/g, '\n        ')}

        <style>
          ${css.replace(/\n/g, '\n          ')}
        </style>
        <script>
          ${js.replace(/\n/g, '\n          ')}
        </script>
      </head>
      ${body}
    </html>`.trim().replace(/\n    /g, '\n')
}