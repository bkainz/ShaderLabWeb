import GLSLParser from './Shader/GLSLParser'

function Shader(pass, type, name, source, isLinked) {
  this.pass = pass
  this.type = type
  this.name = name
  this.source = source
  this.isLinked = isLinked
  this.constInts = GLSLParser.parseConstInts(this.source)
  this.structs = GLSLParser.parseStructs(this.source, this.constInts)
  this.uniforms = GLSLParser.parseUniforms(this.source, this.constInts)
  this.webGlShader = null
}

Shader.prototype = {
  attach() {
    const webGl = this.pass.webGL
    this.webGlShader = webGl.createShader(webGl[this.type.toUpperCase()+'_SHADER'])
    webGl.shaderSource(this.webGlShader, this.source)
    webGl.compileShader(this.webGlShader)
    if (!webGl.getShaderParameter(this.webGlShader, webGl.COMPILE_STATUS)) {
      const message = 'Compilation failed: '+webGl.getShaderInfoLog(this.webGlShader)
      webGl.deleteShader(this.webGlShader)
      this.webGlShader = null
      return message
    }
    else {
      webGl.attachShader(this.pass.program, this.webGlShader)
      return 'Compilation successful'
    }
  },

  detach() {
    if (!this.webGlShader) return
    this.pass.webGL.detachShader(this.pass.program, this.webGlShader)
    this.pass.webGL.deleteShader(this.webGlShader)
    this.webGlShader = null
  }
}

export default Shader