import escapeCSS from '../../../../helpers/escapeCSS'
import camera from '../../../../helpers/camera'
import algebra from '../../../../helpers/algebra'
import state from '../../../../helpers/state'

function updateViewMatrix() {
  const position = this.position || [0, 0, 0]
  const target = this.target || [0, 0, 0]
  const cameraMatrix = camera.camera(position, target, [0, 1, 0])
  this.app.setValue('mat4', 'Camera Matrix', cameraMatrix)
  this.app.setValue('mat3', 'Camera Rotation', algebra.mat4ToMat3(cameraMatrix))
  this.app.setValue('mat4', 'View Matrix', algebra.I(cameraMatrix))
}

function updateProjectionMatrix() {
  const pMatrix = this.projection === 'Perspective' ? camera.perspectiveProjection(this.perspectiveFov, this.width/this.height, this.nearClipping, this.farClipping)
                                                    : camera.orthographicProjection(this.orthographicFov, this.width/this.height, this.nearClipping, this.farClipping)
  this.app.setValue('mat4', 'Projection Matrix', pMatrix)
}

function Camera(el, {className}) {
  this.el = el
  this.className = className
  this.app = el.closest('.components\\/App').__component__
  this.app.camera = this
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

    this.app.onChangedValue('config', 'Projection', value => {
      this.app.setValue('bool', 'Perspective Projection?', value === 'Perspective')
      this.app.setValue('bool', 'Orthographic Projection?', value === 'Orthographic')
      this.el.querySelector(`.${escapeCSS(this.className)}-Field.perspective-fov`).style.display = value === 'Perspective' ? '' : 'none'
      this.el.querySelector(`.${escapeCSS(this.className)}-Field.orthographic-fov`).style.display = value === 'Orthographic' ? '' : 'none'
    })

    this.app.onChangedValue('float', 'Canvas Width', updateProjectionMatrix.bind(this))
    this.app.onChangedValue('float', 'Canvas Height', updateProjectionMatrix.bind(this))
    this.app.el.addEventListener('viewportChanged', ({detail: {width, height}}) => {
      this.width = width
      this.height = height
    })
  },

  get width() {
    return this.app.getValue('float', 'Canvas Width')
  },

  set width(width) {
    this.app.setValue('float', 'Canvas Width', Number(width))
  },

  get height() {
    return this.app.getValue('float', 'Canvas Height')
  },

  set height(height) {
    this.app.setValue('float', 'Canvas Height', Number(height))
  }
}

state.initializeForPrototype(Camera.prototype, STATE)

export default Camera