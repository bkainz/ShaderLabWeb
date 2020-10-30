import algebra from '../../../../../helpers/algebra'

const {T} = algebra

function P(fov, aspect, near, far) {
  const f = Math.tan(Math.PI * 0.5 - 0.5 * fov*180/Math.PI)
  return [f/aspect, 0, 0, 0,
          0, f, 0, 0,
          0, 0, (near+far) / (near-far), -1,
          0, 0, near*far / (near-far) * 2, 0]
}

function Camera(el) {
  this.el = el
  this.app = el.closest('.App').__component__
  this.app.scene.camera = this
}

Camera.prototype = {
  initialize() {
    this.app.registerValue('View Matrix', 'mat4')
    this.app.values.mat4['View Matrix'].value = T(0, -8, -40)
    this.app.registerValue('Projection Matrix', 'mat4')
    this.app.values.mat4['Projection Matrix'].value = T(0, 0, 0)

    this.app.el.addEventListener('viewportChanged', ({detail: {width, height}}) => {
      this.app.values.mat4['Projection Matrix'].value = P(60, width/height, 0.001, 10000)
    })
  }
}

module.exports = Camera