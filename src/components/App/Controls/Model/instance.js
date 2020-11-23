import state from '../helpers/state'
import algebra from '../../../../helpers/algebra'
const {M, T, R, S} = algebra

function updateModelMatrix() {
  const position = this.position || [0, 0, 0]
  const rotationAxis = this.rotationAxis || [0, 0, 1]
  const rotationAngle = this.rotationAngle || 0
  const scale = this.scale || [1, 1, 1]
  const transform = M(R(rotationAngle, rotationAxis), S(scale))
  this.app.values.mat3['Model Transform'].value = algebra.mat4ToMat3(transform)
  this.app.values.mat4['Model Matrix'].value = M(T(position), transform)
}

function Model(el, {className}) {
  this.el = el
  this.className = className
  this.app = el.closest('.App').__component__
  this.app.model = this
}

const STATE = {
  position: {type: 'vec3', name: 'Model Position', onChange: updateModelMatrix},
  rotationAxis: {type: 'vec3', name: 'Model Rotation Axis', onChange: updateModelMatrix},
  rotationAngle: {type: 'float', name: 'Model Rotation Angle', onChange: updateModelMatrix},
  scale: {type: 'vec3',  name: 'Model Scale', onChange: updateModelMatrix},
  depthTest: {type: 'config', name: 'Depth Test'},
  faceCulling: {type: 'config', name: 'Face Culling'},
  frontFace: {type: 'config', name: 'Front Face'},
  showWorldCoordinates: {type: 'config', name: 'Show World Coordinates'}
}

Model.prototype = {
  initialize() {
    state.initializeForInstance(this, STATE)
    this.app.registerValue('Model Transform', 'mat3')
    this.app.registerValue('Model Matrix', 'mat4')
  }
}

state.initializeForPrototype(Model.prototype, STATE)

export default Model