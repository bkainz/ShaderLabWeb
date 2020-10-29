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
    const shaders = []
    for (const passKey in this.props.passes)
      for (const shaderKey in this.props.passes[passKey].shaders) {
        const shader = this.props.passes[passKey].shaders[shaderKey]
        const shaderId = [passKey, shaderKey].filter(Boolean).join('/')
        shaders.push({pass: passKey,
                      type: shaderKey,
                      name: shader.name,
                      linked: this.el.elements[shaderId+'-linked'].checked,
                      source: this.el.elements[shaderId+'-source'].value})
      }
    return shaders
  }
}

module.exports = Editor