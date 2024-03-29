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
    this.webGL = this.canvasEl.getContext('webgl2', {alpha: false, preserveDrawingBuffer: true})
    this.webGL.enable(this.webGL.BLEND)
    this.webGL.blendFunc(this.webGL.SRC_ALPHA, this.webGL.ONE_MINUS_SRC_ALPHA);
    this.webGL.getExtension('OES_standard_derivatives')
    //this.webGL.getExtension('EXT_color_buffer_float')

    const outputProgram = new Program(this.webGL, 'quad')
    outputProgram.update({
      vertex: {source: `#version 300 es

                        in vec3 vertexPosition;
                        in vec2 vertexTextureCoordinates;
                        out vec2 fragmentTextureCoordinates;
  
                        void main() {
                          gl_Position = vec4(vertexPosition, 1.0);
                          fragmentTextureCoordinates = vertexTextureCoordinates;
                        }`},
      fragment: {source: `#version 300 es

                          precision highp float;

                          uniform sampler2D image;

                          in vec2 fragmentTextureCoordinates;
                          out vec4 fragColor;

                          void main() {
                            fragColor = texture(image, fragmentTextureCoordinates.st);
                          }`}
    })
    const outputMesh = new Mesh(this.webGL, 'quad', loadMesh('quad'))
    this.output = new ProgrammedMesh(outputMesh, outputProgram)
    this.outputUniforms = this.app.uniforms.addOutputUniforms(this.output, {image: {name: 'image', type: 'sampler2D'}})

    const originProgram = new Program(this.webGL, 'origin')
    originProgram.update({
      vertex: {source: `#version 300 es

                        in vec3 vertexPosition;
  
                        uniform mat4 mMatrix;
                        uniform mat4 vMatrix;
                        uniform mat4 pMatrix;
  
                        out vec3 fragment_worldSpace;
  
                        void main() {
                          gl_Position = pMatrix * vMatrix * mMatrix * vec4(vertexPosition, 1);
                          fragment_worldSpace = vertexPosition;
                        }`},
      fragment: {source: `#version 300 es

                          precision highp float;

                          in vec3 fragment_worldSpace;
                          out vec4 fragColor;
  
                          void main() {
                            fragColor = vec4(step(0.0001, fragment_worldSpace), 1);
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

      inputSource = program.shaders.vertex.source.replace('#version 300 es', '')
      program.wireframe.update({
        vertex: {source: `#version 300 es
        
                          in vec3 vertexBarycentric;
                          out vec3 fragmentBarycentric;

                          ${inputSource.replace(/gl_Position\s*=\s*[^;]+;/, `
                          $&
                          fragmentBarycentric = vertexBarycentric;`)}`},
        fragment: {source: `#version 300 es

                            precision highp float;
                            in vec3 fragmentBarycentric;
                            out vec4 fragColor;

                            vec4 blendWireframe(vec4 color) {
                              vec3 w = fwidth(fragmentBarycentric);
                              vec3 d = step(w*0.5, fragmentBarycentric);
                              float dEdge = min(min(d.x, d.y), d.z);
                              return mix(vec4(1.0), color, dEdge);
                            }

                            void main() {
                              fragColor = blendWireframe(vec4(0.0));
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
      programmedMesh.blendMode = this.app.getValue('config', 'Blend Mode')
      programmedMesh.wireframe.blendMode = this.app.getValue('config', 'Blend Mode')
      programmedMesh.textureFiltering = this.app.getValue('config', 'Texture Filtering')
      programmedMesh.wireframe.textureFiltering = this.app.getValue('config', 'Texture Filtering')
      programmedMesh.maxAnisotropy = this.app.getValue('config', 'Max. Anisotropy')
      programmedMesh.wireframe.maxAnisotropy = this.app.getValue('config', 'Max. Anisotropy')

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
        },
        blendEnable: ({detail: value}) => {
          programmedMesh.blendEnable = value
          programmedMesh.wireframe.blendEnable = value
        },
        blendOperation: ({detail: value}) => {
          programmedMesh.blendOperation = value
          programmedMesh.wireframe.blendOperation = value
        },
        srcColorBlendFactor: ({detail: value}) => {
          programmedMesh.srcColorBlendFactor = value
          programmedMesh.wireframe.srcColorBlendFactor = value
        },
        dstColorBlendFactor: ({detail: value}) => {
          programmedMesh.dstColorBlendFactor = value
          programmedMesh.wireframe.dstColorBlendFactor = value
        },
        srcAlphaBlendFactor: ({detail: value}) => {
          programmedMesh.srcAlphaBlendFactor = value
          programmedMesh.wireframe.srcAlphaBlendFactor = value
        },
        dstAlphaBlendFactor: ({detail: value}) => {
          programmedMesh.dstAlphaBlendFactor = value
          programmedMesh.wireframe.dstAlphaBlendFactor = value
        },
        textureFiltering: ({detail: value}) => {
          programmedMesh.textureFiltering = value
          programmedMesh.wireframe.textureFiltering = value
        },
        maxAnisotropy: ({detail: value}) => {
          programmedMesh.maxAnisotropy = value
          programmedMesh.wireframe.maxAnisotropy = value
        }
      }

      this.app.values.config['Depth Test'].el.addEventListener('valueChanged', eventListeners.depthTest)
      this.app.values.config['Face Culling'].el.addEventListener('valueChanged', eventListeners.faceCull)
      this.app.values.config['Front Face'].el.addEventListener('valueChanged', eventListeners.frontFace)
      this.app.values.config['Blend Enable'].el.addEventListener('valueChanged', eventListeners.blendEnable)
      this.app.values.config['Blend Operation'].el.addEventListener('valueChanged', eventListeners.blendOperation)
      this.app.values.config['Src Color Blend Factor'].el.addEventListener('valueChanged', eventListeners.srcColorBlendFactor)
      this.app.values.config['Dst Color Blend Factor'].el.addEventListener('valueChanged', eventListeners.dstColorBlendFactor)
      this.app.values.config['Src Alpha Blend Factor'].el.addEventListener('valueChanged', eventListeners.srcAlphaBlendFactor)
      this.app.values.config['Dst Alpha Blend Factor'].el.addEventListener('valueChanged', eventListeners.dstAlphaBlendFactor)
      this.app.values.config['Texture Filtering'].el.addEventListener('valueChanged', eventListeners.textureFiltering)
      this.app.values.config['Max. Anisotropy'].el.addEventListener('valueChanged', eventListeners.maxAnisotropy)

      programmedMesh.eventEl.addEventListener('destroyed', e => {
        this.app.values.config['Depth Test'].el.removeEventListener('valueChanged', eventListeners.depthTest)
        this.app.values.config['Face Culling'].el.removeEventListener('valueChanged', eventListeners.faceCull)
        this.app.values.config['Front Face'].el.removeEventListener('valueChanged', eventListeners.frontFace)
        this.app.values.config['Blend Enable'].el.removeEventListener('valueChanged', eventListeners.blendEnable)
        this.app.values.config['Blend Operation'].el.removeEventListener('valueChanged', eventListeners.blendOperation)
        this.app.values.config['Src Color Blend Factor'].el.removeEventListener('valueChanged', eventListeners.srcColorBlendFactor)
        this.app.values.config['Dst Color Blend Factor'].el.removeEventListener('valueChanged', eventListeners.dstColorBlendFactor)
        this.app.values.config['Src Alpha Blend Factor'].el.removeEventListener('valueChanged', eventListeners.srcAlphaBlendFactor)
        this.app.values.config['Dst Alpha Blend Factor'].el.removeEventListener('valueChanged', eventListeners.dstAlphaBlendFactor)
        this.app.values.config['Texture Filtering'].el.removeEventListener('valueChanged', eventListeners.textureFiltering)
        this.app.values.config['Max. Anisotropy'].el.removeEventListener('valueChanged', eventListeners.maxAnisotropy)
      })
    }

    return programmedMesh
  },

  updateViewport() {
    var devicePixelRatio = window.devicePixelRatio || 1;
    this.canvasEl.width = this.canvasEl.offsetWidth * devicePixelRatio
    this.canvasEl.height = this.canvasEl.offsetHeight * devicePixelRatio
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