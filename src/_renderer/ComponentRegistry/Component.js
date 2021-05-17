import escapeCSS from '../../helpers/escapeCSS'
import React from 'react'
import ReactDomServer from 'react-dom/server'

function Component(registry, component) {
  this.registry = registry
  this.component = component

  this.className = component.className
  this.moduleId = component.instanceScript && this.registry.modules.register(component.instanceScript).id
  this.classStyle = component.classStyle
  this._instanceStyle = component.instanceStyle

  this.prevInstanceId = 0
  this.instances = []
  this.template = ''
}

Component.prototype = {
  registerInstance(props) {
    const filteredProps = {}
    for (let key in props) if (key !== 'children' && key !== 'ref' && key !== 'key') filteredProps[key] = props[key]
    const propsJSON = Object.keys(filteredProps).length ? JSON.stringify(filteredProps) : ''
    const id = this.className+'-'+(this.prevInstanceId += 1)
    this.instances.push(id)
    return <>
             {propsJSON && <script type="application/json" id={`__${id}-props`} dangerouslySetInnerHTML={{__html: propsJSON}}/>}
             <this.component.instantiator className={this.className} id={id} props={props}/>
           </>

  },

  registerTemplate() {
    if (!this.template) {
      const templateInstance = this.component.instantiator({className: this.className, id: '', props: {}})
      this.template = ReactDomServer.renderToStaticMarkup(templateInstance)
    }
    return this.className
  },

  get instanceStyle() {
    return this.instances.map(id => this._instanceStyle.replace(/\${id}/g, escapeCSS(id))).join('\n')
  }
}

export default Component