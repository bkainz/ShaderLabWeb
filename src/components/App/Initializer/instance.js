function Initializer(el) {
  this.app = el.closest('.App').__component__
  this.el = el

  const triggerChangedShaders = () => {
    this.app.el.dispatchEvent(new CustomEvent('shadersChanged', {detail: this.app.editor.shaders}))
  }
  this.app.editor.el.addEventListener('submit', triggerChangedShaders)
  triggerChangedShaders()
}

module.exports = Initializer