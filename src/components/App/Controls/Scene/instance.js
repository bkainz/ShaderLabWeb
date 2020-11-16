function Scene(el) {
  this.el = el
  this.app = el.closest('.App').__component__
  this.app.scene = this
}

Scene.prototype = {
  initialize() {
    this.camera.initialize()
    this.geometry.initialize()
  },

  get state() {
    return {camera: this.camera.state,
            geometry: this.geometry.state}
  },

  set state(state) {
    this.camera.state = state.camera
    this.geometry.state = state.geometry
  }
}

export default Scene