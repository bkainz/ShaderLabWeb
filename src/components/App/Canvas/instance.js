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

  this.framebuffers = {}
  this.meshes = {}
  this.programs = {}
  this.programmedMeshes = {}

  this.canvasEl = null
  this.cameraRotation = new CameraRotation(this)
  this.cameraDolly = new CameraDolly(this)
}

Canvas.prototype = {
  initialize() {
    this.canvasEl = this.el.querySelector(`.${escapeCSS(this.className)}-Canvas`)
    this.webGL = this.canvasEl.getContext('webgl', {alpha: false})
    this.webGL.enable(this.webGL.BLEND)
    this.webGL.blendFunc(this.webGL.SRC_ALPHA, this.webGL.ONE_MINUS_SRC_ALPHA);
    this.webGL.getExtension('OES_standard_derivatives')

    const quadProgram = new Program(this.webGL, 'quad')
    quadProgram.update({
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
    const quadMesh = new Mesh(this.webGL, 'quad', loadMesh('quad'))
    this.quad = new ProgrammedMesh(quadMesh, quadProgram)

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

  set state(state) {
    for (const id in this.programmedMeshes) this.destroyProgrammedMesh(id)
    for (const id in this.programs) this.destroyProgram(id)
    for (const id in this.meshes) this.destroyMesh(id)
    for (const id in this.framebuffers) this.destroyFramebuffer(id)

    for (const id in state.framebuffers) this.createFramebuffer(id, state.framebuffers[id])
    for (const id in state.meshes) this.createMesh(id, state.meshes[id])
    for (const id in state.programs) this.createProgram(id, state.programs[id])
    for (const id in state.programmedMeshes) this.createProgrammedMesh(id, state.programmedMeshes[id])

    const lastFramebufferId = Object.keys(state.framebuffers).pop()
    this.quad.updateUniform('sampler2D', 'image', this.framebuffers[lastFramebufferId].attachments.color)
  },

  // framebuffer CRUD
  createFramebuffer(id) {
    if (this.framebuffers[id]) throw new Error(`framebuffer id "${id}" already taken`)
    this.framebuffers[id] = new Framebuffer(this.webGL, id, this.size)
    this.framebuffers[id].meshes = {}
    const attachments = this.framebuffers[id].attachments
    for (const attachmentId in attachments)
      this.app.setValue('sampler2D', this.framebuffers[id].name+' '+attachmentId, attachments[attachmentId])
  },

  destroyFramebuffer(id) {
    for (const attachmentId in this.framebuffers[id].attachments)
      this.app.removeValue('sampler2D', this.framebuffers[id].name+' '+attachmentId)
    this.framebuffers[id].destroy()
    delete this.framebuffers[id]
  },

  // mesh CRUD
  createMesh(id, {mesh, isModel}) {
    if (this.meshes[id]) throw new Error(`mesh id "${id}" already taken`)
    this.meshes[id] = new Mesh(this.webGL, id, loadMesh(mesh))
    this.meshes[id].isModel = isModel
  },

  updateMesh(id, mesh) {
    this.meshes[id].update(mesh)
  },

  destroyMesh(id) {
    this.meshes[id].destroy()
    delete this.meshes[id]
  },

  // program CRUD
  createProgram(id) {
    if (this.programs[id]) throw new Error(`program id "${id}" already taken`)
    this.programs[id] = {surface: new Program(this.webGL, id),
                         wireframe: new Program(this.webGL, id+'_wireframe')}
  },

  updateProgram(id, shaders) {
    this.programs[id].surface.update(shaders)

    const program = this.programs[id].surface
    this.app.log.append(`<hr data-text="${program.name}: Compile & Link Shaders">`, '')
    for (const type in program.shaders)
      this.app.log.append(program.shaders[type].name, program.shaders[type].compileMessage, !program.shaders[type].isValid)
    this.app.log.append(program.name, program.linkMessage, !program.isValid)

    if (!this.programs[id].surface.isValid) return

    this.programs[id].wireframe.update({
      vertex: {source: `
        attribute vec3 vertex_barycentric;
        varying vec3 fragment_barycentric;

        ${program.shaders.vertex.source.replace(/gl_Position\s*=\s*[^;]+;/, `
        $&
        fragment_barycentric = vertex_barycentric;`)}`},
      fragment: {source: `
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
        }`}
    })

    this.app.el.dispatchEvent(new CustomEvent('programUpdated', {detail: this.programs[id].surface}))
  },

  destroyProgram(id) {
    this.app.el.dispatchEvent(new CustomEvent('programDestroyed', {detail: this.programs[id].surface}))
    this.programs[id].surface.destroy()
    this.programs[id].wireframe.destroy()
    delete this.programs[id]
  },

  // programmed mesh CRUD
  createProgrammedMesh(id, {mesh, program, framebuffer}) {
    if (this.programmedMeshes[id]) throw new Error(`programmed mesh id "${id}" already taken`)

    this.programmedMeshes[id] = this.framebuffers[framebuffer].meshes[id] = {framebuffer}
    for (const type in this.programs[program])
      this.programmedMeshes[id][type] = new ProgrammedMesh(this.meshes[mesh], this.programs[program][type])

    if (!this.meshes[mesh].isModel) return

    for (const type in this.programmedMeshes[id]) {
      this.programmedMeshes[id][type].depthTest = this.app.getValue('config', 'Depth Test')
      this.programmedMeshes[id][type].faceCull = this.app.getValue('config', 'Face Culling')
      this.programmedMeshes[id][type].frontFace = this.app.getValue('config', 'Front Face')
      this.app.onChangedValue('config', 'Depth Test',  value => this.programmedMeshes[id][type].depthTest = value)
      this.app.onChangedValue('config', 'Face Culling', value => this.programmedMeshes[id][type].faceCull = value)
      this.app.onChangedValue('config', 'Front Face', value => this.programmedMeshes[id][type].frontFace = value)
    }
  },

  updateUniform(programId, uniform) {
    this.programmedMeshes[programId].surface.updateUniform(uniform.type, uniform.name, uniform.value)
    this.programmedMeshes[programId].wireframe.updateUniform(uniform.type, uniform.name, uniform.value)
  },

  destroyProgrammedMesh(id) {
    this.programmedMeshes[id].surface.destroy()
    this.programmedMeshes[id].wireframe.destroy()
    delete this.framebuffers[this.programmedMeshes[id].framebuffer].meshes[id]
    delete this.programmedMeshes[id]
  },

  updateViewport() {
    this.canvasEl.width = this.canvasEl.offsetWidth
    this.canvasEl.height = this.canvasEl.offsetHeight
    this.webGL.viewport(0, 0, this.canvasEl.width, this.canvasEl.height)
    for (const id in this.framebuffers) this.framebuffers[id].updateSize(this.size)
    this.app.el.dispatchEvent(new CustomEvent('viewportChanged', {detail: this.size}))
  },

  render() {
    for (const framebufferId in this.framebuffers) {
      this.framebuffers[framebufferId].startRender()

      for (const meshId in this.framebuffers[framebufferId].meshes) {
        const programmedMesh = this.framebuffers[framebufferId].meshes[meshId]
        programmedMesh.surface.render()
        if (programmedMesh.surface.mesh.isModel && this.app.getValue('config', 'Show Wireframe')) {
          this.webGL.enable(this.webGL.POLYGON_OFFSET_FILL)
          this.webGL.polygonOffset(-1, -1)
          programmedMesh.wireframe.render()
          this.webGL.disable(this.webGL.POLYGON_OFFSET_FILL)
        }
      }

      this.framebuffers[framebufferId].endRender()
    }

    this.webGL.bindFramebuffer(this.webGL.FRAMEBUFFER, null)
    this.webGL.clearColor(0, 0, 0, 1)
    this.webGL.clear(this.webGL.COLOR_BUFFER_BIT | this.webGL.DEPTH_BUFFER_BIT)
    this.quad.render()
    this.app.getValue('config', 'Show World Coordinates') && this.origin.render()
  }
}

export default Canvas