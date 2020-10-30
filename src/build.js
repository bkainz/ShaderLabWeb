import fs from 'fs'
import path from 'path'
import url from 'url'
import React from 'react'
import ReactDomServer from 'react-dom/server'
import App from './components/App'
import compReg from './componentRegistry'
import modReg from './moduleRegistry'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const __rootdir = path.dirname(__dirname)

const publicDir = path.join(__rootdir, 'public')
fs.existsSync(publicDir) && fs.rmdirSync(publicDir, {recursive: true})
fs.mkdirSync(publicDir)

fs.symlinkSync(path.join(__rootdir, 'objects'), path.join(publicDir, 'objects'))

const body = ReactDomServer.renderToStaticMarkup(<App/>)

function escapeCSS(value) {
  value = value.replace(/\s/g, '-')
  value = value.replace(/[^0-9a-zA-Z_-\u0080-\uFFFF]/g, '\\$&')
  value = /\d/.test(value[0]) ? '\\3'+value[0]+' '+value.slice(1) : value
  return value
}

const classStyles = []
const instanceStyles = []
const instanceScripts = []
Object.values(compReg.classes).forEach(comp => {
  const classStyle = path.join(comp.dir, 'class.css')
  if (fs.existsSync(classStyle))
    classStyles.push(fs.readFileSync(classStyle, 'utf-8').replace(/\${className}/g, escapeCSS(comp.className)))

  const instanceScript = path.join(comp.dir, 'instance.js')
  if (fs.existsSync(instanceScript)) {
    const {content, dependencies} = modReg.extractDependencies(fs.readFileSync(instanceScript, 'utf-8'), instanceScript)
    instanceScripts.push({className: comp.className, content, dependencies})
  }

  const instanceStyle = path.join(comp.dir, 'instance.css')
  if (fs.existsSync(instanceStyle))
    Object.values(comp.instances).forEach(instance => {
      instanceStyles.push(fs.readFileSync(instanceStyle, 'utf-8').replace(/\${className}/g, escapeCSS(comp.className))
                                                                 .replace(/\${id}/g, escapeCSS(instance.id)))
    })
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
      ${classStyles.join('\n')}
      ${instanceStyles.join('\n')}
    </style>
    <script>
      !function() {
        const modules = {}
        ${Object.keys(modReg.modules).map(id => `
        !function(module${Object.values(modReg.modules[id].dependencies).map(alias => `, ${alias}`).join('')}) {
          ${modReg.modules[id].content.replace(/\n/g, '\n          ')}
          modules['${id}'] = module.exports
        }({}${Object.keys(modReg.modules[id].dependencies).map(id => `, modules['${id}']`).join('')})`
        ).join('\n')}

        const components = ${JSON.stringify(compReg.classes)}
        ${instanceScripts.map(script => `
        !function(module${Object.values(script.dependencies).map(alias => `, ${alias}`).join('')}) {
          ${script.content.replace(/\n/g, '\n          ')}
          components['${script.className}'].Constructor = module.exports
        }({}${Object.keys(script.dependencies).map(id => `, modules['${id}']`).join('')})`
        ).join('\n')}

        new MutationObserver(mutations => {
          for (let mIdx = 0; mIdx < mutations.length; mIdx += 1) {
            for (let nIdx = 0; nIdx < mutations[mIdx].addedNodes.length; nIdx += 1) {
              const node = mutations[mIdx].addedNodes[nIdx]

              if (node.nodeType !== Node.ELEMENT_NODE) continue

              const className = node.classList.item(0)
              const id = node.id

              if (!components[className] || !components[className].Constructor) continue

              node.__component__ = new components[className].Constructor(node, components[className].instances[id])
            }
          }
        }).observe(document.documentElement, {childList: true, subtree: true})
      }()
    </script>
  </head>
  ${body}
</html>`.trim())