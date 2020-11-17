import Scene from './classes/Scene'
import CameraRotation from './classes/CameraRotation'
import CameraDolly from './classes/CameraDolly'
import geometryHelper from '../../../helpers/geometry'

function Canvas(el, {props}) {
  this.el = el
  this.props = props
  this.app = el.closest('.App').__component__
  this.app.canvas = this
  this.scene = new Scene(this, props.passes)
  this.cameraRotation = new CameraRotation(this)
  this.cameraDolly = new CameraDolly(this)
}

Canvas.prototype = {
  initialize() {
    const pass = this.scene.passByKey.base
    for (const bufferKey in pass.attachments) {
      this.app.registerValue(pass.name+' '+bufferKey, 'sampler2D')
      this.app.values.sampler2D[pass.name+' '+bufferKey].value = pass.attachments[bufferKey]
    }

    this.scene.passes.forEach(async pass => {
      const geometry = await geometryHelper.load(this.props.passes[pass.key].geometry)
      this.app.el.dispatchEvent(new CustomEvent('geometryChanged', {detail: {pass: pass.key, geometry}}))
    })

    pass.config.depthTest = this.app.values.config['Depth Test'].value
    this.app.values.config['Depth Test'].el.addEventListener('valueChanged', ({detail: depthTest}) => {
      pass.config.depthTest = depthTest
    })

    pass.config.faceCull = this.app.values.config['Face Culling'].value
    this.app.values.config['Face Culling'].el.addEventListener('valueChanged', ({detail: faceCull}) => {
      pass.config.faceCull = faceCull
    })

    pass.config.frontFace = this.app.values.config['Front Face'].value
    this.app.values.config['Front Face'].el.addEventListener('valueChanged', ({detail: frontFace}) => {
      pass.config.frontFace = frontFace
    })
  },

  get size() {
    return {width: this.el.offsetWidth, height: this.el.offsetHeight}
  },

  updateShaders(pass, shaders) {
    this.app.log.append(`<hr data-text="${this.scene.passByKey[pass].name}: Compile & Link Shaders">`, '')
    shaders.forEach(shader => this.scene.passByKey[pass].updateShader(shader))
    this.scene.passByKey[pass].relink()
  },

  updateUniform(uniform) {
    uniform.pass.updateUniform(uniform.type, uniform.name, uniform.value)
  },

  updateGeometry(pass, geometry) {
    const scope = `<hr data-text="${this.scene.passByKey[pass].name}: Load Geometry">`
    const message = geometry.path.split('/').pop()
    this.app.log.append(scope, message)
    this.scene.passByKey[pass].updateGeometry(geometry)
  },

  updateViewport(width, height) {
    this.el.width = width
    this.el.height = height
    this.scene.updateViewport(width, height)
  },

  render() {
    this.scene.draw()
  }
}

export default Canvas