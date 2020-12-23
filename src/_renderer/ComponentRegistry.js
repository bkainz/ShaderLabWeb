import ModuleRegistry from './ComponentRegistry/ModuleRegistry'
import Component from './ComponentRegistry/Component'

function ComponentRegistry() {
  this.modules = new ModuleRegistry()
  this.components = {}
}

ComponentRegistry.prototype = {
  registerInstance(component, props) {
    this.components[component.className] = this.components[component.className] || new Component(this, component)
    return this.components[component.className].registerInstance(props)
  },
  registerTemplate(component, props) {
    this.components[component.className] = this.components[component.className] || new Component(this, component)
    return this.components[component.className].registerTemplate(props)
  },
  toScript() {
    return `
      !function() {
        ${this.modules.toScript().replace(/\n/g, '\n        ')}

        function Component(className, module, staticInstances, template) {
          this.className = className
          this.module = module
          this.staticInstances = staticInstances
          this.template = template
          this.prevInstanceId = Object.keys(this.staticInstances).length-1
        }
        Component.prototype = {
          instantiate(el, props) {
            if (el.__component__) return el.__component__

            const className = this.className
            const id = el.id
            props = props || {}
            let parentEl = el; while (parentEl = parentEl.parentElement) if (parentEl.__component__) break
            el.__component__ = new this.module(el, {className, id, props, parent: parentEl && parentEl.__component__})
            return el.__component__
          },
          instantiateStaticInstance(el) {
            const id = el.id.slice(this.className.length+1)
            return this.instantiate(el, this.staticInstances[id])
          },
          instantiateTemplate(props) {
            const div = document.createElement('div')
            div.innerHTML = this.template
            const el = div.firstElementChild
            el.classList.add(this.className)
            el.id = this.className+'-'+(this.prevInstanceId += 1)
            return this.instantiate(el, props)
          }
        }
        Component.instantiate = function(className, props = {}) {
          const component = components[className]
          if (!component) throw new Error(\`unknown component \${className}\`)
          return component.instantiateTemplate(props)
        }
        window.Component = Component
        const components = {${Object.values(this.components).filter(component => component.moduleId).map(component => `
          '${component.className}': new Component(
            '${component.className}',
            modules['${component.moduleId}'],
            ${JSON.stringify(component.instances, null, 2).replace(/\n/g, '\n'+' '.repeat(12))},
            ${JSON.stringify(component.template, null, 2).replace(/\n/g, '\n'+' '.repeat(12))}
          )`)}
        }

        new MutationObserver(mutations => {
          for (let mIdx = 0; mIdx < mutations.length; mIdx += 1) {
            for (let nIdx = 0; nIdx < mutations[mIdx].addedNodes.length; nIdx += 1) {
              const node = mutations[mIdx].addedNodes[nIdx]

              if (node.nodeType !== Node.ELEMENT_NODE) continue

              const className = node.classList.item(0)
              components[className] && components[className].instantiateStaticInstance(node)
            }
          }
        }).observe(document.documentElement, {childList: true, subtree: true})
      }()
    `.trim().replace(/\n {6}/g, '\n')
  },
  toStyle() {
    return `
      ${Object.values(this.components).map(component => component.classStyle).join('\n\n')}
      ${Object.values(this.components).map(component => component.instanceStyle).join('\n\n')}
    `.trim().replace(/\n {6}/g, '\n')
  }
}

export default ComponentRegistry