function Scene(el) {
  this.el = el
  this.app = el.closest('.App').__component__
  this.app.scene = this
}

Scene.prototype = {
  initialize() {
    this.camera.initialize()
    this.geometry.initialize()
  }
}

module.exports = Scene