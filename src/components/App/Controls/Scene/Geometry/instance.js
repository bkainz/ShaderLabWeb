import escapeCSS from '../../../../../helpers/escapeCSS'
import algebra from '../../../../../helpers/algebra'
const {M, T, R} = algebra

function Geometry(el, {className}) {
  this.el = el
  this.app = el.closest('.App').__component__
  this.app.scene.geometry = this

  this.depthTestEl = this.el.querySelector(`.${escapeCSS(className)}-FieldInput.depth-test`)
  this.faceCullingEl = this.el.querySelector(`.${escapeCSS(className)}-FieldInput.face-culling`)
  this.frontFaceEl = this.el.querySelector(`.${escapeCSS(className)}-FieldInput.front-face`)
}

Geometry.prototype = {
  initialize() {
    this.app.registerValue('Model Matrix', 'mat4')
    this.app.values.mat4['Model Matrix'].value = M(T(0, -8, 0), R(-90, 1, 0, 0))

    this.app.registerValue('Depth Test', 'config')
    this.app.registerValue('Face Culling', 'config')
    this.app.registerValue('Front Face', 'config')
    this.depthTest = this.depthTestEl.value
    this.faceCulling = this.faceCullingEl.value
    this.frontFace = this.frontFaceEl.value
    this.depthTestEl.addEventListener('input', e => this.depthTest = this.depthTestEl.value)
    this.faceCullingEl.addEventListener('input', e => this.faceCulling = this.faceCullingEl.value)
    this.frontFaceEl.addEventListener('input', e => this.frontFace = this.frontFaceEl.value)
  },

  get depthTest() {
    return this.app.values.config['Depth Test'].value
  },

  set depthTest(depthTest) {
    this.app.values.config['Depth Test'].value = depthTest
  },

  get faceCulling() {
    return this.app.values.config['Face Culling'].value
  },

  set faceCulling(faceCulling) {
    this.app.values.config['Face Culling'].value = faceCulling
  },

  get frontFace() {
    return this.app.values.config['Front Face'].value
  },

  set frontFace(frontFace) {
    this.app.values.config['Front Face'].value = frontFace
  }
}

export default Geometry