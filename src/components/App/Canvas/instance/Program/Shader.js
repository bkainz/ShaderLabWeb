import GLSLParser from './Shader/GLSLParser'

function Shader(webGL, type) {
  this.webGL = webGL
  this.webGlShader = this.webGL.createShader(this.webGL[type.toUpperCase()+'_SHADER'])

  this.constInts = {}
  this.structs = {}
  this.uniforms = {}
}

Shader.prototype = {
  get isValid() {
    return this.webGL.getShaderParameter(this.webGlShader, this.webGL.COMPILE_STATUS)
  },

  get compileMessage() {
    const isCompiled = this.webGL.getShaderParameter(this.webGlShader, this.webGL.COMPILE_STATUS)
    return !isCompiled ? 'Compilation failed: '+this.webGL.getShaderInfoLog(this.webGlShader)
         :               'Compilation successful'
  },

  get source() {
    return this.webGL.getShaderSource(this.webGlShader)
  },
  set source(source) {
    this.webGL.shaderSource(this.webGlShader, source)
    this.webGL.compileShader(this.webGlShader)
    source = GLSLParser.stripComments(source)
    this.constInts = GLSLParser.parseConstInts(source)
    this.structs = GLSLParser.parseStructs(source, this.constInts)
    this.uniforms = GLSLParser.parseUniforms(source, this.constInts)
  },

  destroy() {
    this.webGL.deleteShader(this.webGlShader)
  }
}

export default Shader