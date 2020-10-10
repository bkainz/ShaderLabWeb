import fs from 'fs'
import path from 'path'
import url from 'url'
import React from 'react'
import ReactDomServer from 'react-dom/server'
import App from './components/App'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const __rootdir = path.dirname(__dirname)

const publicDir = path.join(__rootdir, 'public')
fs.existsSync(publicDir) && fs.rmdirSync(publicDir, {recursive: true})
fs.mkdirSync(publicDir)

global.usedComponents = new Set()
const body = ReactDomServer.renderToStaticMarkup(<App/>)

const style = []
const script = []
global.usedComponents.forEach(comp => {
  const dir = decodeURI(new url.URL(path.dirname(comp.url)).pathname)
  const stylePath = path.join(dir, 'style.css')
  const scriptPath = path.join(dir, 'script.js')
  if (fs.existsSync(stylePath)) style.push(fs.readFileSync(stylePath, 'utf-8'))
  if (fs.existsSync(scriptPath)) script.push(fs.readFileSync(scriptPath, 'utf-8'))
})

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
      ${style.join('\n')}
    </style>
    <script>
      ${script.join('\n')}
    </script>
  </head>
  ${body}
</html>`.trim())