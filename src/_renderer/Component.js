import fs from 'fs'
import url from 'url'
import path from 'path'
import escapeCSS from '../helpers/escapeCSS'

const srcDir = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)))

function Component(className, instantiator) {
  this.className = className
  this.instantiator = instantiator

  const instanceScript = path.join(srcDir, this.className, 'instance.js')
  this.instanceScript = fs.existsSync(instanceScript) ? instanceScript
                                                      : ''

  const classStyle = path.join(srcDir, this.className, 'class.css')
  this.classStyle = fs.existsSync(classStyle) ? fs.readFileSync(classStyle, 'utf-8')
                                                  .replace(/\${className}/g, escapeCSS(this.className))
                                              : ''

  const instanceStyle = path.join(srcDir, this.className, 'instance.css')
  this.instanceStyle = fs.existsSync(instanceStyle) ? fs.readFileSync(instanceStyle, 'utf-8')
                                                        .replace(/\${className}/g, escapeCSS(this.className))
                                                    : ''
}

const instantiators = {}
Component.register = function(uri, instantiator) {
  uri = uri.endsWith('/index.js') ? uri.slice(0, -9)
      : uri.endsWith('.js')       ? uri.slice(0, -3)
      :                             uri
  const dir = decodeURI(new url.URL(uri).pathname)
  const className = path.relative(srcDir, dir)
  if (!instantiators[className]) {
    const component = new Component(className, instantiator)
    instantiators[className] = props => global.componentRegistry.registerInstance(component, props)
    instantiators[className].registerTemplate = props => global.componentRegistry.registerTemplate(component, props)
  }
  return instantiators[className]
}

global.Component = Component

export default Component