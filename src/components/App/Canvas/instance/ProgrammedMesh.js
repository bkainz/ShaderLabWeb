function ProgrammedMesh(mesh, program) {
  this.program = program
  this.mesh = mesh
  this.webGL = program.webGL

  this.reset()
  this.depthTest = ''
  this.faceCull = ''
  this.frontFace = 'CCW'

  this.resetListener = e => this.reset()
  this.program.eventEl.addEventListener('changed', this.resetListener)
}

ProgrammedMesh.prototype = {
  reset() {
    this.program.eventEl.removeEventListener('changed', this.resetListener)
    for (const unit in this.createdTextures) this.webGL.deleteTexture(this.createdTextures[unit])
    this.createdTextures = []
    this.uniforms = {}
    this.textures = []
  },

  updateUniform(type, name, value) {
    switch (type) {
      case 'int':
      case 'bool':
      case 'float':
        this.uniforms[name] = {type, value: (Array.isArray(value) ? value : [value]).map(Number)}
        break
      case 'ivec2':
      case 'ivec3':
      case 'ivec4':
      case 'bvec2':
      case 'bvec3':
      case 'bvec4':
      case 'vec2':
      case 'vec3':
      case 'vec4':
      case 'mat2':
      case 'mat3':
      case 'mat4':
        this.uniforms[name] = {type, value: value.map(Number)}
        break
      case 'sampler2D':
      case 'samplerCube':
        const unit = this.uniforms[name] ? this.uniforms[name].value : this.textures.length

        if (this.createdTextures[unit]) {
          this.webGL.deleteTexture(this.createdTextures[unit])
          delete this.createdTextures[unit]
        }

        if (value === null || value instanceof WebGLTexture) {
          this.textures[unit] = value
        }
        else {
          this.textures[unit] = this.createdTextures[unit] = this.webGL.createTexture()
          const target = type === 'sampler2D'   ? this.webGL.TEXTURE_2D
                       : type === 'samplerCube' ? this.webGL.TEXTURE_CUBE_MAP
                       :                          null
          this.webGL.activeTexture(this.webGL.TEXTURE0)
          this.webGL.bindTexture(target, this.textures[unit])

          function isPowerOf2(value){ return (value & (value - 1)) === 0 }
          let isPow2 = true
          for (const target in value) {
            const image = value[target]
            const width = image instanceof Image ? image.naturalWidth : 1
            const height = image instanceof Image ? image.naturalHeight : 1
            isPow2 = isPow2 && isPowerOf2(width) && isPowerOf2(height)
            if (image instanceof Image)
              this.webGL.texImage2D(this.webGL[target], 0, this.webGL.RGBA,
                                    this.webGL.RGBA, this.webGL.UNSIGNED_BYTE, image)
            else
              this.webGL.texImage2D(this.webGL[target], 0, this.webGL.RGBA, width, height, 0,
                                    this.webGL.RGBA, this.webGL.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 1]))

          }

          if (isPow2) {
            this.webGL.generateMipmap(target)
            this.webGL.texParameteri(target, this.webGL.TEXTURE_MIN_FILTER, this.webGL.LINEAR_MIPMAP_LINEAR)
            this.webGL.texParameteri(target, this.webGL.TEXTURE_WRAP_S, this.webGL.REPEAT)
            this.webGL.texParameteri(target, this.webGL.TEXTURE_WRAP_T, this.webGL.REPEAT)
          } else {
            this.webGL.texParameteri(target, this.webGL.TEXTURE_MIN_FILTER, this.webGL.LINEAR)
            this.webGL.texParameteri(target, this.webGL.TEXTURE_WRAP_S, this.webGL.CLAMP_TO_EDGE)
            this.webGL.texParameteri(target, this.webGL.TEXTURE_WRAP_T, this.webGL.CLAMP_TO_EDGE)
          }
          this.webGL.bindTexture(target, null)
        }

        this.uniforms[name] = {type, value: unit}
        break
      default:
        throw new Error(`unknown or unsupported uniform type '${type}'`)
    }
  },

  render() {
    if (!this.program.isValid) return

    this.webGL.useProgram(this.program.webGlProgram)

    if (this.depthTest) {
      this.webGL.enable(this.webGL.DEPTH_TEST)
      this.webGL.depthFunc(this.webGL[this.depthTest])
    } else {
      this.webGL.disable(this.webGL.DEPTH_TEST)
    }

    if (this.faceCull) {
      this.webGL.enable(this.webGL.CULL_FACE)
      this.webGL.cullFace(this.webGL[this.faceCull])
    } else {
      this.webGL.disable(this.webGL.CULL_FACE)
    }

    this.webGL.frontFace(this.webGL[this.frontFace])

    for (const name in this.uniforms) {
      const {type, value} = this.uniforms[name]
      const location = this.webGL.getUniformLocation(this.program.webGlProgram, name)
      switch (type) {
        case 'int':
        case 'bool':
          this.webGL.uniform1iv(location, value)
          break
        case 'ivec2':
        case 'ivec3':
        case 'ivec4':
        case 'bvec2':
        case 'bvec3':
        case 'bvec4':
          this.webGL[`uniform${type[4]}iv`](location, value)
          break
        case 'float':
          this.webGL.uniform1fv(location, value)
          break
        case 'vec2':
        case 'vec3':
        case 'vec4':
          this.webGL[`uniform${type[3]}fv`](location, value)
          break
        case 'mat2':
        case 'mat3':
        case 'mat4':
          this.webGL[`uniformMatrix${type[3]}fv`](location, false, value)
          break
        case 'sampler2D':
        case 'samplerCube':
          this.webGL.activeTexture(this.webGL.TEXTURE0+value)
          const target = type === 'sampler2D'   ? this.webGL.TEXTURE_2D
                       : type === 'samplerCube' ? this.webGL.TEXTURE_CUBE_MAP
                       :                          null
          this.webGL.bindTexture(target, this.textures[value])
          this.webGL.uniform1i(location, value)
          break
        default:
          throw new Error(`unknown or unsupported uniform type '${type}'`)
      }
    }

    this.mesh.renderWith(this.program)

    for (const name in this.uniforms) {
      const {type, value} = this.uniforms[name]
      const location = this.webGL.getUniformLocation(this.program.webGlProgram, name)
      switch (type) {
        case 'int':
        case 'bool':
        case 'ivec2':
        case 'bvec2':
        case 'ivec3':
        case 'bvec3':
        case 'ivec4':
        case 'bvec4':
        case 'float':
        case 'vec2':
        case 'vec3':
        case 'vec4':
        case 'mat2':
        case 'mat3':
        case 'mat4':
          break
        case 'sampler2D':
        case 'samplerCube':
          this.webGL.activeTexture(this.webGL.TEXTURE0+value)
          const target = type === 'sampler2D'   ? this.webGL.TEXTURE_2D
                       : type === 'samplerCube' ? this.webGL.TEXTURE_CUBE_MAP
                       :                          null
          this.webGL.bindTexture(target, null)
          this.webGL.uniform1i(location, null)
          break
        default:
          throw new Error(`unknown or unsupported uniform type '${type}'`)
      }
    }
  },

  destroy() {
    this.reset()
  }
}

export default ProgrammedMesh