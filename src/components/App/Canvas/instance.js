import Framebuffer from './instance/Framebuffer'
import Mesh from './instance/Mesh'
import Program from './instance/Program'
import ProgrammedMesh from './instance/ProgrammedMesh'
import CameraRotation from './instance/CameraRotation'
import CameraDolly from './instance/CameraDolly'
import loadMesh from '../../../helpers/loadMesh'
import algebra from '../../../helpers/algebra'

function Canvas(el, {props}) {
  this.el = el
  this.props = props
  this.app = el.closest('.App').__component__
  this.app.canvas = this
  this.cameraRotation = new CameraRotation(this)
  this.cameraDolly = new CameraDolly(this)

  this.webGL = el.getContext('webgl', {alpha: false})
  this.webGL.enable(this.webGL.BLEND)
  this.webGL.blendFunc(this.webGL.SRC_ALPHA, this.webGL.ONE_MINUS_SRC_ALPHA);

  this.framebuffers = {}
  this.userProgrammedMeshes = {}
  for (const id of props.passes) {
    this.firstPass = this.firstPass || id
    this.lastPass = id
    this.framebuffers[id] = new Framebuffer(this.webGL)
    this.userProgrammedMeshes[id] = new ProgrammedMesh(new Mesh(this.webGL), new Program(this.webGL, id))
  }

  const quadProgram = new Program(this.webGL, 'quad')
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

  const quadMesh = new Mesh(this.webGL)
  quadMesh.update(loadMesh('quad'))

  this.quad = new ProgrammedMesh(quadMesh, quadProgram)
  this.quad.updateUniform('sampler2D', 'image', this.framebuffers[this.lastPass].attachments.color)

  const originProgram = new Program(this.webGL, 'origin')
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

  const originMesh = new Mesh(this.webGL)
  originMesh.update(loadMesh('origin'))

  this.origin = new ProgrammedMesh(originMesh, originProgram)
  this.origin.updateUniform('mat4', 'mMatrix', algebra.S([5, 5, 5]))
}

Canvas.prototype = {
  initialize() {
    const firstFramebuffer = this.framebuffers[this.firstPass]
    const firstProgrammedMesh = this.userProgrammedMeshes[this.firstPass]

    for (const attachment in firstFramebuffer.attachments) {
      const attachmentId = firstProgrammedMesh.program.name+' '+attachment
      this.app.registerValue(attachmentId, 'sampler2D')
      this.app.values.sampler2D[attachmentId].value = firstFramebuffer.attachments[attachment]
    }

    firstProgrammedMesh.depthTest = this.app.values.config['Depth Test'].value
    this.app.values.config['Depth Test'].el.addEventListener('valueChanged', ({detail: depthTest}) => {
      firstProgrammedMesh.depthTest = depthTest
    })

    firstProgrammedMesh.faceCull = this.app.values.config['Face Culling'].value
    this.app.values.config['Face Culling'].el.addEventListener('valueChanged', ({detail: faceCull}) => {
      firstProgrammedMesh.faceCull = faceCull
    })

    firstProgrammedMesh.frontFace = this.app.values.config['Front Face'].value
    this.app.values.config['Front Face'].el.addEventListener('valueChanged', ({detail: frontFace}) => {
      firstProgrammedMesh.frontFace = frontFace
    })

    this.app.values.mat4['View Matrix'].el.addEventListener('valueChanged', ({detail: value}) => {
      this.origin.updateUniform('mat4', 'vMatrix', value)
    })

    this.app.values.mat4['Projection Matrix'].el.addEventListener('valueChanged', ({detail: value}) => {
      this.origin.updateUniform('mat4', 'pMatrix', value)
    })

    this.userProgrammedMeshes[this.lastPass].mesh.update(loadMesh('quad'))
  },

  get size() {
    return {width: this.el.offsetWidth, height: this.el.offsetHeight}
  },

  updateProgram(programId, shaders) {
    const program = this.userProgrammedMeshes[programId].program
    this.app.log.append(`<hr data-text="${program.name}: Compile & Link Shaders">`, '')

    shaders.forEach(shader => {
      const compileMessage = program.updateShader(shader.type, shader.source, shader.isLinked)
      this.app.log.append(shader.name, compileMessage)
    })

    const linkMessage = program.relink()

    if (!linkMessage) {
      this.userProgrammedMeshes[programId].reset()
      this.app.el.dispatchEvent(new CustomEvent('userProgramUpdated', {detail: program}))
    }

    this.app.log.append(program.name, linkMessage ? 'Linking failed: '+linkMessage
                                                  : 'Linking successful')
  },

  updateMesh(programId, mesh) {
    this.userProgrammedMeshes[programId].mesh.update(mesh)
  },

  updateUniform(programId, uniform) {
    this.userProgrammedMeshes[programId].updateUniform(uniform.type, uniform.name, uniform.value)
  },

  updateViewport(width, height) {
    this.el.width = width
    this.el.height = height
    this.webGL.viewport(0, 0, width, height)
    for (const id in this.framebuffers) this.framebuffers[id].updateViewport(width, height)
  },

  render() {
    for (const id of this.props.passes) {
      this.framebuffers[id].startRender()
      this.userProgrammedMeshes[id].render()
      this.framebuffers[id].endRender()
    }

    this.webGL.bindFramebuffer(this.webGL.FRAMEBUFFER, null)
    this.webGL.clearColor(0, 0, 0, 1)
    this.webGL.clear(this.webGL.COLOR_BUFFER_BIT | this.webGL.DEPTH_BUFFER_BIT)
    this.quad.render()
    this.app.values.config['Show World Coordinates'].value && this.origin.render()
  }
}

export default Canvas