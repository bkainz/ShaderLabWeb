import escapeCSS from '../../../../../helpers/escapeCSS'
import camera from '../../../../../helpers/camera'
import state from '../helpers/state'

function updateViewMatrix() {
  const position = this.position || [0, 0, 0]
  const target = this.target || [0, 0, 0]
  this.app.values.mat4['View Matrix'].value = camera.viewMatrix(position, target, [0, 1, 0])
}

function updateProjectionMatrix() {
  const pMatrix = this.projection === 'Perspective' ? camera.perspectiveProjection(this.perspectiveFov, this.width/this.height, this.nearClipping, this.farClipping)
                                                    : camera.orthographicProjection(this.orthographicFov, this.width/this.height, this.nearClipping, this.farClipping)
  this.app.values.mat4['Projection Matrix'].value = pMatrix
}

function Camera(el, {className}) {
  this.el = el
  this.className = className
  this.app = el.closest('.App').__component__
  this.app.scene.camera = this
}

const STATE = {
  position: {type: 'vec3', name: 'Camera Position', onChange: updateViewMatrix},
  target: {type: 'vec3', name: 'Camera Target', onChange: updateViewMatrix},
  nearClipping: {type: 'float', name: 'Near Clipping Plan', onChange: updateProjectionMatrix},
  farClipping: {type: 'float', name: 'Far Clipping Plane', onChange: updateProjectionMatrix},
  projection: {type: 'config', name: 'Projection', onChange: updateProjectionMatrix},
  perspectiveFov: {type: 'float', name: 'Perspective FOV', onChange: updateProjectionMatrix},
  orthographicFov: {type: 'float', name: 'Orthographic FOV', onChange: updateProjectionMatrix}
}

Camera.prototype = {
  initialize() {
    state.initializeForInstance(this, STATE)

    this.app.registerValue('Perspective Projection?', 'bool')
    this.app.registerValue('Orthographic Projection?', 'bool')
    this.app.values.config['Projection'].el.addEventListener('valueChanged', ({detail: value}) => {
      this.app.values.bool['Perspective Projection?'].value = value === 'Perspective'
      this.app.values.bool['Orthographic Projection?'].value = value === 'Orthographic'
      this.el.querySelector(`.${escapeCSS(this.className)}-Field.perspective-fov`).style.display = value === 'Perspective' ? '' : 'none'
      this.el.querySelector(`.${escapeCSS(this.className)}-Field.orthographic-fov`).style.display = value === 'Orthographic' ? '' : 'none'
    })

    this.app.registerValue('Canvas Width', 'float')
    this.app.registerValue('Canvas Height', 'float')
    this.app.values.float['Canvas Width'].el.addEventListener('valueChanged', updateProjectionMatrix.bind(this))
    this.app.values.float['Canvas Height'].el.addEventListener('valueChanged', updateProjectionMatrix.bind(this))
    this.app.el.addEventListener('viewportChanged', ({detail: {width, height}}) => {
      this.width = width
      this.height = height
    })

    this.app.registerValue('View Matrix', 'mat4')
    this.app.registerValue('Projection Matrix', 'mat4')
  },

  get width() {
    return this.app.values.float['Canvas Width'].value
  },

  set width(width) {
    this.app.values.float['Canvas Width'].value = Number(width)
  },

  get height() {
    return this.app.values.float['Canvas Height'].value
  },

  set height(height) {
    this.app.values.float['Canvas Height'].value = Number(height)
  }
}

state.initializeForPrototype(Camera.prototype, STATE)

export default Camera