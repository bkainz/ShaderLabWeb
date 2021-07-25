import Shader from './Program/Shader'

function Program(webGL) {
  this.webGL = webGL
  this.webGlProgram = this.webGL.createProgram()
  this.eventEl = document.createElement('div')
  this.shaders = {}
}

Program.prototype = {
  get isValid() {
    return this.webGL.getProgramParameter(this.webGlProgram, this.webGL.LINK_STATUS)
  },

  get linkMessage() {
    return !this.isValid ? 'Linking failed: '+this.webGL.getProgramInfoLog(this.webGlProgram)
                         : 'Linking successful'
  },

  update(shaders) {
    for (const type in shaders) {
      if (!this.shaders[type])
        this.shaders[type] = new Shader(this.webGL, type)
      else if (this.webGL.getAttachedShaders(this.webGlProgram).indexOf(this.shaders[type].webGlShader) !== -1)
        this.webGL.detachShader(this.webGlProgram, this.shaders[type].webGlShader)

      this.shaders[type].source = shaders[type].source
      this.shaders[type].isValid && this.webGL.attachShader(this.webGlProgram, this.shaders[type].webGlShader)
    }
    this.webGL.linkProgram(this.webGlProgram)
    this.eventEl.dispatchEvent(new Event('updated'))
  },

  destroy() {
    this.webGL.deleteProgram(this.webGlProgram)
    for (const type in this.shaders) this.shaders[type].destroy()
    this.eventEl.dispatchEvent(new Event('destroyed'))
  }
}

export default Program