function Editor(el, {props}) {
  this.el = el
  this.app = el.closest('.App').__component__
  this.app.editor = this
  this.props = props
  this.shaders = {}
}

Editor.prototype = {
  initialize() {
    const updateShaders = () => {
      Object.keys(this.shaders).forEach(pass => {
        const shaders = Object.values(this.shaders[pass]).map(shader => shader.state)
        this.app.el.dispatchEvent(new CustomEvent('shadersChanged', {detail: {pass, shaders}}))
      })
    }

    this.el.addEventListener('submit', e => {updateShaders(); e.preventDefault()})
    updateShaders()
  }
}

export default Editor