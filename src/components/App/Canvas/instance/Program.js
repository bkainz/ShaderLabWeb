import Shader from './Program/Shader'

function Program(webGL, id) {
  this.webGL = webGL
  this.id = id
  this.webGlProgram = this.webGL.createProgram()
  this.name = this.id[0].toUpperCase()+this.id.slice(1)+' Pass'
  this.shaders = {}
}

Program.prototype = {
  get isValid() {
    return this.webGL.getProgramParameter(this.webGlProgram, this.webGL.LINK_STATUS)
  },

  updateShader(type, source, isLinked) {
    this.shaders[type] && this.shaders[type].detach(this.webGL, this.webGlProgram)

    if (isLinked) {
      const shader = new Shader(this, type, source, isLinked)
      this.shaders[type] = shader
      return shader.attach(this.webGL, this.webGlProgram)
    }
    else {
      this.shaders[type] = null
      return {failed: false, message: 'Skipped (not linked)'}
    }
  },

  relink() {
    if (!('fragment' in this.shaders && 'vertex' in this.shaders)) return
    this.webGL.linkProgram(this.webGlProgram)
    const message = this.webGL.getProgramInfoLog(this.webGlProgram)
    return {failed: !!message, message: message ? 'Linking failed: '+message
                                                : 'Linking successful'}
  }
}

export default Program