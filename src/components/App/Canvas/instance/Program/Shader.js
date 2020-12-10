import GLSLParser from './Shader/GLSLParser'

function Shader(program, type, source, isLinked) {
  this.program = program
  this.type = type
  this.source = source
  this.isLinked = isLinked
  this.constInts = GLSLParser.parseConstInts(this.source)
  this.structs = GLSLParser.parseStructs(this.source, this.constInts)
  this.uniforms = GLSLParser.parseUniforms(this.source, this.constInts)
  this.webGlShader = null
}

Shader.prototype = {
  attach() {
    const webGl = this.program.webGL
    this.webGlShader = webGl.createShader(webGl[this.type.toUpperCase()+'_SHADER'])
    webGl.shaderSource(this.webGlShader, this.source)
    webGl.compileShader(this.webGlShader)
    if (!webGl.getShaderParameter(this.webGlShader, webGl.COMPILE_STATUS)) {
      const message = 'Compilation failed: '+webGl.getShaderInfoLog(this.webGlShader)
      webGl.deleteShader(this.webGlShader)
      this.webGlShader = null
      return {failed: true, message}
    }
    else {
      webGl.attachShader(this.program.webGlProgram, this.webGlShader)
      return {failed: false, message: 'Compilation successful'}
    }
  },

  detach() {
    if (!this.webGlShader) return
    this.program.webGL.detachShader(this.program.webGlProgram, this.webGlShader)
    this.program.webGL.deleteShader(this.webGlShader)
    this.webGlShader = null
  }
}

export default Shader