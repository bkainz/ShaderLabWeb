function Scene(el) {
  this.el = el
  this.app = el.closest('.App').__component__
  this.app.scene = this
}

Scene.prototype = {
  initialize() {
    // nothing to do
  }
}

module.exports = Scene