import escapeCSS from '../../../../helpers/escapeCSS'

function Shader(el, {className, props}) {
  this.el = el
  this.className = className
  this.pass = props.pass
  this.type = props.type
  this.name = props.name
  this.id = [props.pass, props.type].filter(Boolean).join('/')
  this.app = el.closest('.App').__component__
  this.app.editor.shaders.push(this)
}

Shader.prototype = {
  get source() {
    return this.el.querySelector(`.${escapeCSS(this.className)}-Source`).value
  },

  get linked() {
    return this.el.querySelector(`.${escapeCSS(this.className)}-isLinked`).checked
  }
}

export default Shader