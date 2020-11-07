import fs from 'fs'
import url from 'url'
import path from 'path'
import moduleRegistry from './moduleRegistry'
import escapeCSS from './helpers/escapeCSS'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

function Component(dir, className) {
  this.dir = dir
  this.className = className

  this.instances = {}
  this._instanceCount = 0

  const instanceScript = path.join(dir, 'instance.js')
  this.moduleId = fs.existsSync(instanceScript) ? moduleRegistry.register(instanceScript).id
                                                : ''

  const classStyle = path.join(dir, 'class.css')
  this.classStyle = fs.existsSync(classStyle) ? fs.readFileSync(classStyle, 'utf-8')
                                                  .replace(/\${className}/g, escapeCSS(this.className))
                                              : ''

  const instanceStyle = path.join(dir, 'instance.css')
  this._instanceStyle = fs.existsSync(instanceStyle) ? fs.readFileSync(instanceStyle, 'utf-8')
                                                         .replace(/\${className}/g, escapeCSS(this.className))
                                                     : ''
}

Component.prototype = {
  registerInstance(props) {
    const id = this.className+'-'+(this._instanceCount += 1)
    return this.instances[id] = {className: this.className, id, props}
  },

  get instanceStyle() {
    return Object.values(this.instances).map(instance => this._instanceStyle
                                                             .replace(/\${id}/g, escapeCSS(instance.id))).join('\n')
  }
}

const components = {}

export default {
  register(uri, props) {
    const dir = decodeURI(new url.URL(path.dirname(uri)).pathname)
    const className = path.relative(path.join(__dirname, 'components'), dir)
    if (!components[className]) components[className] = new Component(dir, className)
    return components[className].registerInstance(props)
  },
  toScript() {
    return `
      ${moduleRegistry.toScript().replace(/\n/g, '\n      ')}

      function Component(className, module) {
        this.className = className
        this.module = module
      }
      Component.prototype = {
        instantiate(el, id) {
          if (!this.module) return
          el.__component__ = new this.module(el, componentInstances[id])
        }
      }
      const components = {${Object.values(components).map(component => `
        '${component.className}': new Component('${component.className}', modules['${component.moduleId}'])`).join(',')}
      }
      const componentInstances = {${Object.values(components).map(component =>
        Object.values(component.instances).map(instance => `
        '${instance.id}': ${JSON.stringify(instance)}`
        ).join(',')).join(',')}
      }

      new MutationObserver(mutations => {
        for (let mIdx = 0; mIdx < mutations.length; mIdx += 1) {
          for (let nIdx = 0; nIdx < mutations[mIdx].addedNodes.length; nIdx += 1) {
            const node = mutations[mIdx].addedNodes[nIdx]

            if (node.nodeType !== Node.ELEMENT_NODE) continue

            const className = node.classList.item(0)
            const id = node.id

            components[className] && components[className].instantiate(node, id)
          }
        }
      }).observe(document.documentElement, {childList: true, subtree: true})
    `.trim().replace(/\n {6}/g, '\n')
  },
  toStyle() {
    return `
      ${Object.values(components).map(component => component.classStyle).join('\n')}
      ${Object.values(components).map(component => component.instanceStyle).join('\n')}
    `.trim().replace(/\n {6}/g, '\n')
  }
}