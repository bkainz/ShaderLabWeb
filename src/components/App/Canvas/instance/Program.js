import Shader from './Program/Shader'

function Program(canvas) {
  this.canvas = canvas
  this.webGL = canvas.webGL
  this.webGlProgram = this.webGL.createProgram()
  this.shaders = {}

  this.el = document.createElement('div')
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
      return 'Skipped (not linked)'
    }
  },

  relink() {
    if (!('fragment' in this.shaders && 'vertex' in this.shaders)) return
    this.el.dispatchEvent(new CustomEvent('linking', {detail: this}))
    this.webGL.linkProgram(this.webGlProgram)
    return this.webGL.getProgramInfoLog(this.webGlProgram)
  }
}

export default Program