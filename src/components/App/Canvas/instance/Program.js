import Shader from './Program/Shader'

function Program(webGL, id) {
  this.webGL = webGL
  this.id = id
  this.webGlProgram = this.webGL.createProgram()
  this.eventEl = document.createElement('div')
  this.name = this.id[0].toUpperCase()+this.id.slice(1)+' Pass'
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
      if (this.shaders[type]) {
        if (this.webGL.getAttachedShaders(this.webGlProgram).indexOf(this.shaders[type].webGlShader) !== -1)
          this.webGL.detachShader(this.webGlProgram, this.shaders[type].webGlShader)
        this.shaders[type].name = shaders[type].name
        this.shaders[type].source = shaders[type].source
        this.shaders[type].isLinked = shaders[type].isLinked !== false
      }
      else {
        this.shaders[type] = new Shader(this.webGL, type, shaders[type])
      }

      this.shaders[type].isValid && this.webGL.attachShader(this.webGlProgram, this.shaders[type].webGlShader)
    }
    this.webGL.linkProgram(this.webGlProgram)
    this.eventEl.dispatchEvent(new Event('changed'))
  },

  destroy() {
    this.webGL.deleteProgram(this.webGlProgram)
    for (const type in this.shaders) this.shaders[type].destroy()
  }
}

export default Program