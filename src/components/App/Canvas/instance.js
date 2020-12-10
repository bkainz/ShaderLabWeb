import Framebuffer from './instance/Framebuffer'
import Mesh from './instance/Mesh'
import Program from './instance/Program'
import ProgrammedMesh from './instance/ProgrammedMesh'
import CameraRotation from './instance/CameraRotation'
import CameraDolly from './instance/CameraDolly'
import loadMesh from '../../../helpers/loadMesh'
import algebra from '../../../helpers/algebra'

function Canvas(el) {
  this.el = el
  this.app = el.closest('.App').__component__
  this.app.canvas = this
  this.cameraRotation = new CameraRotation(this)
  this.cameraDolly = new CameraDolly(this)

  this.webGL = el.getContext('webgl', {alpha: false})
  this.webGL.enable(this.webGL.BLEND)
  this.webGL.blendFunc(this.webGL.SRC_ALPHA, this.webGL.ONE_MINUS_SRC_ALPHA);
  this.webGL.getExtension('OES_standard_derivatives')

  this.userFramebuffers = {}
  this.userProgrammedMeshes = {}
  this.modelProgramId = null

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
    this.app.onChangedValue('mat4', 'View Matrix', value => this.origin.updateUniform('mat4', 'vMatrix', value))
    this.app.onChangedValue('mat4', 'Projection Matrix', value => this.origin.updateUniform('mat4', 'pMatrix', value))
  },

  get size() {
    return {width: this.el.offsetWidth, height: this.el.offsetHeight}
  },

  updateProgram(programId, shaders) {
    if (!this.userProgrammedMeshes[programId]) {
      const framebuffer = new Framebuffer(this.webGL)
      const programmedMesh = new ProgrammedMesh(new Mesh(this.webGL), new Program(this.webGL, programId))

      if (!Object.keys(this.userProgrammedMeshes).length) {
        this.modelProgramId = programId
        this.wireframeRenderer = new ProgrammedMesh(programmedMesh.mesh, new Program(this.webGL, 'wireframe'))

        for (const attachment in framebuffer.attachments) {
          const attachmentId = programmedMesh.program.name+' '+attachment
          this.app.setValue('sampler2D', attachmentId, framebuffer.attachments[attachment])
        }

        this.app.onChangedValue('config','Depth Test',  value => {
          programmedMesh.depthTest = value
          this.wireframeRenderer.depthTest = value
        })

        this.app.onChangedValue('config', 'Face Culling', value => {
          programmedMesh.faceCull = value
          this.wireframeRenderer.faceCull = value
        })

        this.app.onChangedValue('config', 'Front Face', value => {
          programmedMesh.frontFace = value
          this.wireframeRenderer.frontFace = value
        })
      }
      else {
        programmedMesh.mesh.update(loadMesh('quad'))
      }

      this.quad.updateUniform('sampler2D', 'image', framebuffer.attachments.color)

      this.userFramebuffers[programId] = framebuffer
      this.userProgrammedMeshes[programId] = programmedMesh
    }

    const program = this.userProgrammedMeshes[programId].program
    this.app.log.append(`<hr data-text="${program.name}: Compile & Link Shaders">`, '')

    shaders.forEach(shader => {
      const compileStatus = program.updateShader(shader.type, shader.source, shader.isLinked)
      this.app.log.append(shader.name, compileStatus.message, compileStatus.failed)
    })

    const linkStatus = program.relink()

    if (!linkStatus.failed) {
      if (programId === this.modelProgramId) {
        const vertexSource = `
          attribute vec3 vertex_barycentric;
          varying vec3 fragment_barycentric;

          ${program.shaders.vertex.source.replace(/gl_Position\s*=\s*[^;]+;/, `
          $&
          fragment_barycentric = vertex_barycentric;`)}`.replace(/\n {8}/g, '\n')
        this.wireframeRenderer.program.updateShader('vertex', vertexSource, true)

        const fragmentSource = `
          #extension GL_OES_standard_derivatives : enable
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
          }`.replace(/\n {8}/g, '\n')
        this.wireframeRenderer.program.updateShader('fragment', fragmentSource, true)
        this.wireframeRenderer.program.relink()
      }

      this.userProgrammedMeshes[programId].reset()
      this.app.el.dispatchEvent(new CustomEvent('userProgramUpdated', {detail: program}))
    }

    this.app.log.append(program.name, linkStatus.message, linkStatus.failed)
  },

  updateMesh(programId, mesh) {
    this.userProgrammedMeshes[programId].mesh.update(mesh)
    programId === this.modelProgramId && this.wireframeRenderer.mesh.update(mesh)
  },

  updateUniform(programId, uniform) {
    this.userProgrammedMeshes[programId].updateUniform(uniform.type, uniform.name, uniform.value)
    programId === this.modelProgramId && this.wireframeRenderer.updateUniform(uniform.type, uniform.name, uniform.value)
  },

  updateViewport(width, height) {
    this.el.width = width
    this.el.height = height
    this.webGL.viewport(0, 0, width, height)
    for (const id in this.userFramebuffers) this.userFramebuffers[id].updateViewport(width, height)
  },

  render() {
    for (const programId in this.userProgrammedMeshes) {
      this.userFramebuffers[programId].startRender()
      this.userProgrammedMeshes[programId].render()
      if (programId === this.modelProgramId && this.app.getValue('config', 'Show Wireframe')) {
        this.webGL.enable(this.webGL.POLYGON_OFFSET_FILL)
        this.webGL.polygonOffset(-1, -1)
        this.wireframeRenderer.render()
        this.webGL.disable(this.webGL.POLYGON_OFFSET_FILL)
      }
      this.userFramebuffers[programId].endRender()
    }

    this.webGL.bindFramebuffer(this.webGL.FRAMEBUFFER, null)
    this.webGL.clearColor(0, 0, 0, 1)
    this.webGL.clear(this.webGL.COLOR_BUFFER_BIT | this.webGL.DEPTH_BUFFER_BIT)
    this.quad.render()
    this.app.getValue('config', 'Show World Coordinates') && this.origin.render()
  }
}

export default Canvas