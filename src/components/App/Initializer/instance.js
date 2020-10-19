function Initializer(el) {
  this.app = el.closest('.App').__component__
  this.el = el

  const triggerChangedShaders = () => {
    this.app.el.dispatchEvent(new CustomEvent('shadersChanged', {detail: this.app.editor.shaders}))
  }
  this.app.editor.el.addEventListener('submit', triggerChangedShaders)
  triggerChangedShaders()

  const triggerChangedGeometry = ({detail}) => {
    this.app.el.dispatchEvent(new CustomEvent('geometryChanged', {detail}))
  }
  this.app.scene.el.addEventListener('objectChanged', triggerChangedGeometry)
  this.app.scene.objects.base && triggerChangedGeometry({detail: {stage: 'base', object: this.app.scene.objects.base}})
  this.app.scene.objects.R2T && triggerChangedGeometry({detail: {stage: 'R2T', object: this.app.scene.objects.R2T}})

  this.app.el.dispatchEvent(new Event('resized'))
}

module.exports = Initializer