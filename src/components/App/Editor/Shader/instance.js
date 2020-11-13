import escapeCSS from '../../../../helpers/escapeCSS'

function Shader(el, {className, props}) {
  this.el = el
  this.className = className
  this.pass = props.pass
  this.type = props.type
  this.name = props.name
  this.id = [props.pass, props.type].filter(Boolean).join('/')
  this.app = el.closest('.App').__component__
  this.app.editor.shaders[this.pass] = this.app.editor.shaders[this.pass] || {}
  this.app.editor.shaders[this.pass][this.id] = this
}

Shader.prototype = {
  get state() {
    const source = this.el.querySelector(`.${escapeCSS(this.className)}-Source`).value
    const isLinked = this.el.querySelector(`.${escapeCSS(this.className)}-isLinked`).checked
    return {pass: this.pass, type: this.type, source, isLinked, name: this.name}
  }
}

export default Shader