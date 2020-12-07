import Program from './Program'
import Model from './Model'
import Framebuffer from './Framebuffer'
import ProgramModel from './ProgramModel'

function Pass(canvas, key, name) {
  this.canvas = canvas
  this.key = key
  this.name = name
  this.framebuffer = new Framebuffer(canvas.webGL)
  this.program = new Program(canvas, this)
  this.programModel = new ProgramModel(new Model(canvas), this.program)
}

Pass.prototype = {
  updateShaders(shaders) {
    this.canvas.app.log.append(`<hr data-text="${this.name}: Compile & Link Shaders">`, '')

    shaders.forEach(shader => {
      const compileMessage = this.program.updateShader(shader.type, shader.source, shader.isLinked)
      this.canvas.app.log.append(shader.name, compileMessage)
    })

    const linkMessage = this.program.relink()

    if (linkMessage) {
      this.canvas.app.log.append(this.name, 'Linking failed: '+linkMessage)
    }
    else {
      this.canvas.app.log.append(this.name, 'Linking successful')
      this.canvas.app.el.dispatchEvent(new CustomEvent('passShadersUpdated', {detail: this}))
    }
  },

  updateModel(mesh) {
    this.programModel.model.updateMesh(mesh)
  },

  updateUniform(uniform) {
    this.programModel.updateUniform(uniform.type, uniform.name, uniform.value)
  },

  render() {
    this.framebuffer.render(this.programModel)
  }
}

export default Pass