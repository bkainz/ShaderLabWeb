import state from '../helpers/state'
import algebra from '../../../../helpers/algebra'
const {M, T, R} = algebra

function Geometry(el, {className}) {
  this.el = el
  this.className = className
  this.app = el.closest('.App').__component__
  this.app.geometry = this
}

const STATE = {
  depthTest: {type: 'config', name: 'Depth Test'},
  faceCulling: {type: 'config', name: 'Face Culling'},
  frontFace: {type: 'config', name: 'Front Face'}
}

Geometry.prototype = {
  initialize() {
    state.initializeForInstance(this, STATE)

    this.app.registerValue('Model Matrix', 'mat4')
    this.app.values.mat4['Model Matrix'].value = M(T(0, -8, 0), R(-90, 1, 0, 0))
  }
}

state.initializeForPrototype(Geometry.prototype, STATE)

export default Geometry