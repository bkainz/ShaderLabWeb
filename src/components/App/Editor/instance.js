function Editor(el, {props}) {
  this.app = el.closest('.App').__component__
  this.app.editor = this
  this.el = el
  this.props = props

  el.addEventListener('submit', e => e.preventDefault())
}

Editor.prototype = {
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