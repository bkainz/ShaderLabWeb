import fs from 'fs'
import path from 'path'
import url from 'url'
import React from 'react'
import ReactDomServer from 'react-dom/server'
import App from './components/App'
import componentRegistry from './componentRegistry'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const __rootdir = path.dirname(__dirname)

const publicDir = path.join(__rootdir, 'public')
fs.existsSync(publicDir) && fs.rmdirSync(publicDir, {recursive: true})
fs.mkdirSync(publicDir)

fs.symlinkSync(path.join(__rootdir, 'objects'), path.join(publicDir, 'objects'))

const body = ReactDomServer.renderToStaticMarkup(<App/>)

fs.writeFileSync(path.join(publicDir, 'index.html'), `
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="initial-scale=1.0, width=device-width">
    <meta name="referrer" content="unsafe-url">

    <title>ShaderLabWeb</title>
    
    <style>
      ${componentRegistry.toStyle().replace(/\n/g, '\n      ')}
    </style>
    <script>
      !function() {
        ${componentRegistry.toScript().replace(/\n/g, '\n        ')}
      }()
    </script>
  </head>
  ${body}
</html>`.trim())