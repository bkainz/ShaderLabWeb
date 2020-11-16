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
  this.app.editor.shaders[this.pass][this.type] = this
}

Shader.prototype = {
  get state() {
    return {source: this.el.querySelector(`.${escapeCSS(this.className)}-Source`).value,
            isLinked: this.el.querySelector(`.${escapeCSS(this.className)}-isLinked`).checked}
  },

  set state(state) {
    this.el.querySelector(`.${escapeCSS(this.className)}-Source`).value = state.source
    this.el.querySelector(`.${escapeCSS(this.className)}-isLinked`).checked = state.isLinked
  }
}

export default Shader