import Pass from './instance/Pass'
import Program from './instance/Program'
import Model from './instance/Model'
import ProgramModel from './instance/ProgramModel'
import CameraRotation from './instance/CameraRotation'
import CameraDolly from './instance/CameraDolly'
import geometryHelper from '../../../helpers/geometry'
import algebra from '../../../helpers/algebra'

function Canvas(el, {props}) {
  this.el = el
  this.props = props
  this.app = el.closest('.App').__component__
  this.app.canvas = this
  this.cameraRotation = new CameraRotation(this)
  this.cameraDolly = new CameraDolly(this)

  this.webGL = el.getContext('webgl')

  this.passByKey = {}
  for (const key in props.passes) this.passByKey[key] = new Pass(this, key, props.passes[key].name)
  this.passes = Object.values(this.passByKey)

  const quadProgram = new Program(this)
  quadProgram.updateShader('vertex', `
    attribute vec3 vertex_worldSpace;
    attribute vec2 textureCoordinate_input;
    varying vec2 uvs;
    
    void main() {
      gl_Position = vec4(vertex_worldSpace, 1.0);
      uvs = textureCoordinate_input;
    }`, true)
  quadProgram.updateShader('fragment', `
    precision mediump float;
    uniform sampler2D image;
    varying vec2 uvs;
    
    void main() {
      gl_FragColor = texture2D(image, uvs.st);
    }`, true)
  quadProgram.relink()

  const quadModel = new Model(this)
  quadModel.updateVertices(geometryHelper.quad)

  this.quad = new ProgramModel(quadModel, quadProgram)
  this.quad.updateUniform('sampler2D', 'image', this.passes[this.passes.length-1].framebuffer.attachments.color)

  const originProgram = new Program(this)
  originProgram.updateShader('vertex', `
    attribute vec3 vertex_worldSpace;
    
    uniform mat4 mMatrix;
    uniform mat4 vMatrix;
    uniform mat4 pMatrix;
    
    varying vec3 fragment_worldSpace;
    
    void main() {
      gl_Position = pMatrix * vMatrix * mMatrix * vec4(vertex_worldSpace, 1);
      fragment_worldSpace = vertex_worldSpace;
    }`, true)
  originProgram.updateShader('fragment', `
    precision mediump float;
    
    varying vec3 fragment_worldSpace;
    
    void main() {
      gl_FragColor = vec4(step(0.0001, fragment_worldSpace), 1);
    }`, true)
  originProgram.relink()

  const originModel = new Model(this)
  originModel.updateVertices(geometryHelper.origin)

  this.origin = new ProgramModel(originModel, originProgram)
  this.origin.updateUniform('mat4', 'mMatrix', algebra.S([5, 5, 5]))
}

Canvas.prototype = {
  initialize() {
    Object.keys(this.passByKey).forEach(async pass => {
      const geometry = await geometryHelper.load(this.props.passes[pass].geometry)
      this.app.el.dispatchEvent(new CustomEvent('geometryChanged', {detail: {pass, geometry}}))
    })

    const basePass = this.passByKey.base
    for (const bufferKey in basePass.framebuffer.attachments) {
      this.app.registerValue(basePass.name+' '+bufferKey, 'sampler2D')
      this.app.values.sampler2D[basePass.name+' '+bufferKey].value = basePass.framebuffer.attachments[bufferKey]
    }

    basePass.programModel.depthTest = this.app.values.config['Depth Test'].value
    this.app.values.config['Depth Test'].el.addEventListener('valueChanged', ({detail: depthTest}) => {
      basePass.programModel.depthTest = depthTest
    })

    basePass.programModel.faceCull = this.app.values.config['Face Culling'].value
    this.app.values.config['Face Culling'].el.addEventListener('valueChanged', ({detail: faceCull}) => {
      basePass.programModel.faceCull = faceCull
    })

    basePass.programModel.frontFace = this.app.values.config['Front Face'].value
    this.app.values.config['Front Face'].el.addEventListener('valueChanged', ({detail: frontFace}) => {
      basePass.programModel.frontFace = frontFace
    })

    this.app.values.mat4['View Matrix'].el.addEventListener('valueChanged', ({detail: value}) => {
      this.origin.updateUniform('mat4', 'vMatrix', value)
    })

    this.app.values.mat4['Projection Matrix'].el.addEventListener('valueChanged', ({detail: value}) => {
      this.origin.updateUniform('mat4', 'pMatrix', value)
    })
  },

  get size() {
    return {width: this.el.offsetWidth, height: this.el.offsetHeight}
  },

  updateShaders(pass, shaders) {
    this.passByKey[pass].updateShaders(shaders)
  },

  updateModel(pass, geometry) {
    this.passByKey[pass].updateModel(geometry)
  },

  updateUniform(pass, uniform) {
    this.passByKey[pass].updateUniform(uniform)
  },

  updateViewport(width, height) {
    this.el.width = width
    this.el.height = height
    this.webGL.viewport(0, 0, width, height)
    this.passes.forEach(pass => pass.framebuffer.updateViewport(width, height))
  },

  render() {
    this.passes.forEach(pass => pass.render())

    this.webGL.bindFramebuffer(this.webGL.FRAMEBUFFER, null)
    this.webGL.clearColor(0, 0, 0, 1)
    this.webGL.clear(this.webGL.COLOR_BUFFER_BIT | this.webGL.DEPTH_BUFFER_BIT)
    this.quad.render()
    this.app.values.config['Show World Coordinates'].value && this.origin.render()
  }
}

export default Canvas