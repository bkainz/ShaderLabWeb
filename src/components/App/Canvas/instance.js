import Framebuffer from './instance/Framebuffer'
import Mesh from './instance/Mesh'
import Program from './instance/Program'
import ProgrammedMesh from './instance/ProgrammedMesh'
import CameraRotation from './instance/CameraRotation'
import CameraDolly from './instance/CameraDolly'
import escapeCSS from '../../../componentHelpers/escapeCSS'
import loadMesh from '../../../componentHelpers/loadMesh'
import algebra from '../../../componentHelpers/algebra'

function Canvas(el, {className}) {
  this.el = el
  this.className = className
  this.app = el.closest('.components\\/App').__component__
  this.app.canvas = this

  this.framebuffers = new Set()
  this.meshes = {}

  this.canvasEl = null
  this.cameraRotation = new CameraRotation(this)
  this.cameraDolly = new CameraDolly(this)
}

Canvas.prototype = {
  initialize() {
    this.canvasEl = this.el.querySelector(`.${escapeCSS(this.className)}-Canvas`)
    this.webGL = this.canvasEl.getContext('webgl', {alpha: false, preserveDrawingBuffer: true})
    this.webGL.enable(this.webGL.BLEND)
    this.webGL.blendFunc(this.webGL.SRC_ALPHA, this.webGL.ONE_MINUS_SRC_ALPHA);
    this.webGL.getExtension('OES_standard_derivatives')

    const outputProgram = new Program(this.webGL, 'quad')
    outputProgram.update({
      vertex: {source: `attribute vec3 vertex_worldSpace;
                        attribute vec2 textureCoordinate_input;
                        varying vec2 uvs;
  
                        void main() {
                          gl_Position = vec4(vertex_worldSpace, 1.0);
                          uvs = textureCoordinate_input;
                        }`},
      fragment: {source: `precision mediump float;
                          uniform sampler2D image;
                          varying vec2 uvs;
  
                          void main() {
                            gl_FragColor = texture2D(image, uvs.st);
                          }`}
    })
    const outputMesh = new Mesh(this.webGL, 'quad', loadMesh('quad'))
    this.output = new ProgrammedMesh(outputMesh, outputProgram)
    this.outputUniforms = this.app.uniforms.addOutputUniforms(this.output, {image: {name: 'image', type: 'sampler2D'}})

    const originProgram = new Program(this.webGL, 'origin')
    originProgram.update({
      vertex: {source: `attribute vec3 vertex_worldSpace;
  
                        uniform mat4 mMatrix;
                        uniform mat4 vMatrix;
                        uniform mat4 pMatrix;
  
                        varying vec3 fragment_worldSpace;
  
                        void main() {
                          gl_Position = pMatrix * vMatrix * mMatrix * vec4(vertex_worldSpace, 1);
                          fragment_worldSpace = vertex_worldSpace;
                        }`},
      fragment: {source: `precision mediump float;
  
                          varying vec3 fragment_worldSpace;
  
                          void main() {
                            gl_FragColor = vec4(step(0.0001, fragment_worldSpace), 1);
                          }`}
    })
    const originMesh = new Mesh(this.webGL, 'origin', loadMesh('origin'))
    this.origin = new ProgrammedMesh(originMesh, originProgram)
    this.origin.updateUniform('mat4', 'mMatrix', algebra.S([5, 5, 5]))

    this.app.onChangedValue('mat4', 'View Matrix', value => this.origin.updateUniform('mat4', 'vMatrix', value))
    this.app.onChangedValue('mat4', 'Projection Matrix', value => this.origin.updateUniform('mat4', 'pMatrix', value))

    this.updateViewport()
  },

  get size() {
    return {width: this.canvasEl.width, height: this.canvasEl.height}
  },

  get outputImage() {
    return this.outputUniforms.fields.image.attachment
  },
  set outputImage(outputImage) {
    this.outputUniforms.fields.image.attachment = outputImage
  },

  get state() {
    return {image: this.outputImage}
  },
  set state(state) {
    this.outputImage = state.image
  },

  createMesh(id, mesh) {
    if (this.meshes[id]) throw new Error(`mesh id "${id}" already taken`)
    this.meshes[id] = new Mesh(this.webGL, id, loadMesh(mesh))
  },

  updateMesh(id, mesh) {
    this.meshes[id].update(mesh)
  },

  destroyMesh(id) {
    this.meshes[id].destroy()
    delete this.meshes[id]
  },

  createFramebuffer() {
    const framebuffer = new Framebuffer(this.webGL, this.size)
    this.framebuffers.add(framebuffer)
    framebuffer.eventEl.addEventListener('destroyed', e => this.framebuffers.delete(framebuffer))
    return framebuffer
  },

  createProgram() {
    const program = new Program(this.webGL)
    program.wireframe = new Program(this.webGL)

    program.eventEl.addEventListener('updated', e => {
      if (!program.isValid) return

      program.wireframe.update({
        vertex: {source: `attribute vec3 vertex_barycentric;
                          varying vec3 fragment_barycentric;

                          ${program.shaders.vertex.source.replace(/gl_Position\s*=\s*[^;]+;/, `
                          $&
                          fragment_barycentric = vertex_barycentric;`)}`},
        fragment: {source: `#extension GL_OES_standard_derivatives : enable
                            precision mediump float;
                            varying vec3 fragment_barycentric;

                            vec4 blendWireframe(vec4 fragColor) {
                              vec3 w = fwidth(fragment_barycentric);
                              vec3 d = step(w*0.5, fragment_barycentric);
                              float dEdge = min(min(d.x, d.y), d.z);
                              return mix(vec4(1.0), fragColor, dEdge);
                            }

                            void main() {
                              gl_FragColor = blendWireframe(vec4(0.0));
                            }`}
      })
    })

    program.eventEl.addEventListener('destroyed', e => program.wireframe.destroy())

    return program
  },

  createProgrammedMesh(meshId, program) {
    const programmedMesh = new ProgrammedMesh(this.meshes[meshId], program)
    programmedMesh.wireframe = new ProgrammedMesh(this.meshes[meshId], program.wireframe)

    programmedMesh.eventEl.addEventListener('updatedUniform', ({detail: uniform}) => {
      programmedMesh.wireframe.updateUniform(uniform.type, uniform.name, uniform.value)
    })

    programmedMesh.eventEl.addEventListener('destroyed', e => {
      programmedMesh.wireframe.destroy()
    })

    if (this.meshes[meshId].id === 'Model') {
      programmedMesh.depthTest = this.app.getValue('config', 'Depth Test')
      programmedMesh.wireframe.depthTest = this.app.getValue('config', 'Depth Test')
      programmedMesh.faceCull = this.app.getValue('config', 'Face Culling')
      programmedMesh.wireframe.faceCull = this.app.getValue('config', 'Face Culling')
      programmedMesh.frontFace = this.app.getValue('config', 'Front Face')
      programmedMesh.wireframe.frontFace = this.app.getValue('config', 'Front Face')

      const eventListeners = {
        depthTest: ({detail: value}) => {
          programmedMesh.depthTest = value
          programmedMesh.wireframe.depthTest = value
        },
        faceCull: ({detail: value}) => {
          programmedMesh.faceCull = value
          programmedMesh.wireframe.faceCull = value
        },
        frontFace: ({detail: value}) => {
          programmedMesh.frontFace = value
          programmedMesh.wireframe.frontFace = value
        }
      }

      this.app.values.config['Depth Test'].el.addEventListener('valueChanged', eventListeners.depthTest)
      this.app.values.config['Face Culling'].el.addEventListener('valueChanged', eventListeners.faceCull)
      this.app.values.config['Front Face'].el.addEventListener('valueChanged', eventListeners.frontFace)

      programmedMesh.eventEl.addEventListener('destroyed', e => {
        this.app.values.config['Depth Test'].el.removeEventListener('valueChanged', eventListeners.depthTest)
        this.app.values.config['Face Culling'].el.removeEventListener('valueChanged', eventListeners.faceCull)
        this.app.values.config['Front Face'].el.removeEventListener('valueChanged', eventListeners.frontFace)
      })
    }

    return programmedMesh
  },

  updateViewport() {
    this.canvasEl.width = this.canvasEl.offsetWidth
    this.canvasEl.height = this.canvasEl.offsetHeight
    this.webGL.viewport(0, 0, this.canvasEl.width, this.canvasEl.height)
    for (const framebuffer of this.framebuffers ) framebuffer.updateSize(this.size)
    this.app.el.dispatchEvent(new CustomEvent('viewportChanged', {detail: this.size}))
  },

  render() {
    for (const framebuffer of this.framebuffers) {
      framebuffer.startRender()

      for (const programmedMesh of framebuffer.meshes) {
        programmedMesh.render()
        if (programmedMesh.mesh.id === 'Model' && this.app.getValue('config', 'Show Wireframe')) {
          this.webGL.enable(this.webGL.POLYGON_OFFSET_FILL)
          this.webGL.polygonOffset(-1, -1)
          programmedMesh.wireframe.render()
          this.webGL.disable(this.webGL.POLYGON_OFFSET_FILL)
        }
      }

      framebuffer.endRender()
    }

    this.webGL.bindFramebuffer(this.webGL.FRAMEBUFFER, null)
    this.webGL.clearColor(0, 0, 0, 1)
    this.webGL.clear(this.webGL.COLOR_BUFFER_BIT | this.webGL.DEPTH_BUFFER_BIT)
    this.output.render()
    this.app.getValue('config', 'Show World Coordinates') && this.origin.render()
  }
}

export default Canvas