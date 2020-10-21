function Editor(el, {props}) {
  this.el = el
  this.app = el.closest('.App').__component__
  this.app.editor = this
  this.props = props
}

Editor.prototype = {
  initialize() {
    this.el.addEventListener('submit', e => {
      this.app.el.dispatchEvent(new CustomEvent('shadersChanged', {detail: this.shaders}))
      e.preventDefault()
    })
    this.app.el.dispatchEvent(new CustomEvent('shadersChanged', {detail: this.shaders}))
  },

  get shaders() {
    return this.props.shaders.map(shader => {
      const shaderId = [shader.stage, shader.type].filter(Boolean).join('/')
      return {stage: shader.stage,
              type: shader.type,
              name: shader.name,
              linked: this.el.elements[shaderId+'-linked'].checked,
              source: this.el.elements[shaderId+'-source'].value}
    })
  }
}

module.exports = Editor