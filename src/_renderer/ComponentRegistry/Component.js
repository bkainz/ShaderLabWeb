import escapeCSS from '../../helpers/escapeCSS'
import ReactDomServer from 'react-dom/server'

function Component(registry, component) {
  this.registry = registry
  this.component = component

  this.className = component.className
  this.moduleId = component.instanceScript && this.registry.modules.register(component.instanceScript).id
  this.classStyle = component.classStyle
  this._instanceStyle = component.instanceStyle

  this.prevInstanceId = 0
  this.instances = {}
  this.template = ''
}

Component.prototype = {
  registerInstance(props) {
    const id = this.prevInstanceId += 1
    this.instances[id] = Object.assign({}, props)
    return this.component.instantiator({className: this.className, id: this.className+'-'+id, props: this.instances[id]})
  },

  registerTemplate() {
    if (!this.template) {
      const templateInstance = this.component.instantiator({className: this.className, id: '', props: {}})
      this.template = ReactDomServer.renderToStaticMarkup(templateInstance)
    }
    return this.className
  },

  get instanceStyle() {
    return Object.keys(this.instances).map(id => this._instanceStyle.replace(/\${id}/g, escapeCSS(this.className+'-'+id))).join('\n')
  }
}

export default Component