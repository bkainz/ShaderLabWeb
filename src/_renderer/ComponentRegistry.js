import postcss from 'postcss'
import postcssNesting from 'postcss-nesting'

import ModuleRegistry from './ComponentRegistry/ModuleRegistry'
import Component from './ComponentRegistry/Component'

function ComponentRegistry() {
  this.modules = new ModuleRegistry()
  this.components = {}
}

ComponentRegistry.prototype = {
  registerClass(component) {
    component.explicitDependencies.forEach(component => component.registerClass())
    this.components[component.className] = this.components[component.className] || new Component(this, component)
    return true
  },
  registerInstance(component, props) {
    this.registerClass(component)
    return this.components[component.className].registerInstance(props)
  },
  registerTemplate(component, props) {
    this.registerClass(component)
    return this.components[component.className].registerTemplate(props)
  },
  toScript() {
    return `
      !function() {
        ${this.modules.toScript().replace(/\n/g, '\n        ')}

        function Component(className, module, template) {
          this.className = className
          this.module = module
          this.template = template
          this.largestInstanceId = 0
        }
        Component.prototype = {
          instantiate(el, props) {
            if (el.__component__) return el.__component__

            props = props || {}
            const className = this.className
            const id = el.getAttribute('id')
            const instanceId = Number(el.getAttribute('id').slice(this.className.length+1))
            this.largestInstanceId = instanceId > this.largestInstanceId ? instanceId : this.largestInstanceId
            const ancestors = []
            let ancestorEl = el; while (ancestorEl = ancestorEl.parentElement) if (ancestorEl.__component__) ancestors.push(ancestorEl.__component__)
            el.__component__ = new this.module(el, {className, id, props, ancestors})
            return el.__component__
          },
          instantiateTemplate(props) {
            const div = document.createElement('div')
            div.innerHTML = this.template
            const el = div.firstElementChild
            el.classList.add(this.className)
            el.setAttribute('id', this.className+'-'+(this.largestInstanceId+1))
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
            ${JSON.stringify(component.template, null, 2).replace(/\n/g, '\n'+' '.repeat(12))}
          )`)}
        }

        document.addEventListener('DOMContentLoaded', () => {
          new MutationObserver(mutations => {
            for (let mIdx = 0; mIdx < mutations.length; mIdx += 1) {
              for (let nIdx = 0; nIdx < mutations[mIdx].addedNodes.length; nIdx += 1) {
                const node = mutations[mIdx].addedNodes[nIdx]
                if (node.nodeType !== Node.ELEMENT_NODE) continue
                instantiateComponentTree(node)
              }

              for (let nIdx = 0; nIdx < mutations[mIdx].removedNodes.length; nIdx += 1) {
                const node = mutations[mIdx].removedNodes[nIdx]
                if (node.nodeType !== Node.ELEMENT_NODE) continue

                let element
                const elements = document.createNodeIterator(node, NodeFilter.SHOW_ELEMENT)
                while(element = elements.nextNode()) {
                  const component = components[element.classList.item(0)]
                  if (!component) continue
                  element.__component__.onUnmounted && element.__component__.onUnmounted()
                }
              }
            }
          }).observe(document.documentElement, {childList: true, subtree: true})

          function instantiateComponentTree(element) {
            const elements = document.createNodeIterator(element, NodeFilter.SHOW_ELEMENT)
            while(element = elements.nextNode()) {
              const component = components[element.classList.item(0)]
              if (!component) continue
              const propsEl = document.getElementById('__'+element.getAttribute('id')+'-props')
              const props = propsEl ? JSON.parse(propsEl.parentElement.removeChild(propsEl).innerText) : {}
              component.instantiate(element, props)
            }
          }

          instantiateComponentTree(document.documentElement)
        })
      }()
    `.trim().replace(/\n {6}/g, '\n')
  },
  async toStyle() {
    const style = `
      ${Object.values(this.components).map(component => component.classStyle).join('\n\n')}
      ${Object.values(this.components).map(component => component.instanceStyle).join('\n\n')}
    `.trim().replace(/\n {6}/g, '\n')

    const processed = await postcss([postcssNesting]).process(style, {from: 'style.css'})
    return processed.css
  }
}

export default ComponentRegistry