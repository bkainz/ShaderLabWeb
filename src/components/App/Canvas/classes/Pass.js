import Textures from './Pass/Textures'
import Geometry from './Geometry'

function Pass(scene, key, config, renderToCanvas = false) {
  this.scene = scene
  this.webGL = scene.webGL
  this.key = key
  this.name = config.name
  this.shaders = Object.keys(config.shaders).reduce((shaders, shaderType) => (shaders[shaderType] = null, shaders), {})
  this.program = this.webGL.createProgram()
  this.config = {
    depthTest: '',
    faceCull: '',
    frontFace: 'CCW'
  }
  this.geometry = null
  this.textures = new Textures(this, this.webGL.getParameter(this.webGL.MAX_COMBINED_TEXTURE_IMAGE_UNITS))

  if (renderToCanvas) {
    this.framebuffer = null
    this.attachments = {color: null}
    return
  }

  this.framebuffer = this.webGL.createFramebuffer()
  this.attachments = {color: this.webGL.createTexture()}

  if (this.webGL.getExtension('WEBGL_depth_texture')) {
    this.attachments.depth = this.webGL.createTexture()
  } else {
    this.depthBuffer = this.webGL.createRenderbuffer()
  }

  this.webGL.bindFramebuffer(this.webGL.FRAMEBUFFER, this.framebuffer)

  this.webGL.activeTexture(this.webGL.TEXTURE0)
  this.webGL.bindTexture(this.webGL.TEXTURE_2D, this.attachments.color)
  this.webGL.framebufferTexture2D(this.webGL.FRAMEBUFFER, this.webGL.COLOR_ATTACHMENT0, this.webGL.TEXTURE_2D, this.attachments.color, 0)
  this.webGL.bindTexture(this.webGL.TEXTURE_2D, null)

  if (this.attachments.depth) {
    this.webGL.activeTexture(this.webGL.TEXTURE0)
    this.webGL.bindTexture(this.webGL.TEXTURE_2D, this.attachments.depth)
    this.webGL.framebufferTexture2D(this.webGL.FRAMEBUFFER, this.webGL.DEPTH_ATTACHMENT, this.webGL.TEXTURE_2D, this.attachments.depth, 0)
    this.webGL.bindTexture(this.webGL.TEXTURE_2D, null)
  } else {
    this.webGL.bindRenderbuffer(this.webGL.RENDERBUFFER, this.depthBuffer)
    this.webGL.framebufferRenderbuffer(this.webGL.FRAMEBUFFER, this.webGL.DEPTH_ATTACHMENT, this.webGL.RENDERBUFFER, this.depthBuffer)
    this.webGL.bindRenderbuffer(this.webGL.RENDERBUFFER, null)
  }

  this.webGL.bindFramebuffer(this.webGL.FRAMEBUFFER, null)
}

Pass.prototype = {
  updateViewport(width, height) {
    if (!this.framebuffer) return

    this.webGL.activeTexture(this.webGL.TEXTURE0)
    this.webGL.bindTexture(this.webGL.TEXTURE_2D, this.attachments.color)
    this.webGL.texImage2D(this.webGL.TEXTURE_2D, 0, this.webGL.RGBA, width, height, 0,
                          this.webGL.RGBA, this.webGL.UNSIGNED_BYTE, null)
    this.webGL.texParameteri(this.webGL.TEXTURE_2D, this.webGL.TEXTURE_MIN_FILTER, this.webGL.LINEAR)
    this.webGL.texParameteri(this.webGL.TEXTURE_2D, this.webGL.TEXTURE_WRAP_S, this.webGL.CLAMP_TO_EDGE)
    this.webGL.texParameteri(this.webGL.TEXTURE_2D, this.webGL.TEXTURE_WRAP_T, this.webGL.CLAMP_TO_EDGE)
    this.webGL.bindTexture(this.webGL.TEXTURE_2D, null)

    if (this.attachments.depth) {
      this.webGL.activeTexture(this.webGL.TEXTURE0)
      this.webGL.bindTexture(this.webGL.TEXTURE_2D, this.attachments.depth)
      this.webGL.texImage2D(this.webGL.TEXTURE_2D, 0, this.webGL.DEPTH_COMPONENT, width, height, 0,
                            this.webGL.DEPTH_COMPONENT, this.webGL.UNSIGNED_INT, null)
      this.webGL.texParameteri(this.webGL.TEXTURE_2D, this.webGL.TEXTURE_MIN_FILTER, this.webGL.LINEAR)
      this.webGL.texParameteri(this.webGL.TEXTURE_2D, this.webGL.TEXTURE_WRAP_S, this.webGL.CLAMP_TO_EDGE)
      this.webGL.texParameteri(this.webGL.TEXTURE_2D, this.webGL.TEXTURE_WRAP_T, this.webGL.CLAMP_TO_EDGE)
      this.webGL.bindTexture(this.webGL.TEXTURE_2D, null)
    } else {
      this.webGL.bindRenderbuffer(this.webGL.RENDERBUFFER, this.depthBuffer)
      this.webGL.renderbufferStorage(this.webGL.RENDERBUFFER, this.webGL.DEPTH_COMPONENT16, width, height)
      this.webGL.bindRenderbuffer(this.webGL.RENDERBUFFER, null)
    }
  },

  updateShader({type, source, linked}) {
    this.shaders[type] && this.webGL.detachShader(this.program, this.shaders[type])
    this.shaders[type] && this.webGL.deleteShader(this.shaders[type])
    this.shaders[type] = null
    this.textures.reset()

    let message
    if (linked) {
      ({shader: this.shaders[type], message} = createShader(this.webGL, type, source))
      this.shaders[type] && this.webGL.attachShader(this.program, this.shaders[type])
    } else {
      message = 'not linked'
    }

    return message
  },

  relink() {
    this.webGL.linkProgram(this.program)
    return this.webGL.getProgramInfoLog(this.program) || 'Linking successful'
  },

  updateGeometry(geometry) {
    this.geometry = new Geometry(this.webGL, geometry)
  },

  updateUniform(type, name, value) {
    this.webGL.useProgram(this.program)
    const location = this.webGL.getUniformLocation(this.program, name)
    switch (type) {
      case 'int':
      case 'bool':
        this.webGL.uniform1i(location, value)
        break
      case 'ivec2':
      case 'bvec2':
      case 'ivec3':
      case 'bvec3':
      case 'ivec4':
      case 'bvec4':
        this.webGL[`uniform${type[4]}iv`](location, value)
        break
      case 'float':
        this.webGL.uniform1f(location, value)
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
        let texture
        if (value instanceof WebGLTexture) {
          texture = value
        }
        else {
          texture = this.webGL.createTexture()
          const target = type === 'sampler2D'   ? this.webGL.TEXTURE_2D
                       : type === 'samplerCube' ? this.webGL.TEXTURE_CUBE_MAP
                       :                          null
          this.webGL.activeTexture(this.webGL.TEXTURE0)
          this.webGL.bindTexture(target, texture)

          function isPowerOf2(value){ return (value & (value - 1)) === 0 }
          let isPow2 = true
          for (const target in value) {
            const image = value[target]
            const width = image instanceof Image ? image.width : 1
            const height = image instanceof Image ? image.height : 1
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
          } else {
            this.webGL.texParameteri(target, this.webGL.TEXTURE_MIN_FILTER, this.webGL.LINEAR)
            this.webGL.texParameteri(target, this.webGL.TEXTURE_WRAP_S, this.webGL.CLAMP_TO_EDGE)
            this.webGL.texParameteri(target, this.webGL.TEXTURE_WRAP_T, this.webGL.CLAMP_TO_EDGE)
          }
          this.webGL.bindTexture(target, null)
        }

        const unit = this.textures.add(texture, type)
        if (unit !== false) this.webGL.uniform1i(location, unit)
        break
      default:
        throw new Error(`unknown or unsupported uniform type '${type}'`)
    }
  },

  draw() {
    if (!this.webGL.getProgramParameter(this.program, this.webGL.LINK_STATUS) || !this.geometry) return

    this.webGL.useProgram(this.program)

    if (this.config.depthTest) {
      this.webGL.enable(this.webGL.DEPTH_TEST)
      this.webGL.depthFunc(this.webGL[this.config.depthTest])
    } else {
      this.webGL.disable(this.webGL.DEPTH_TEST)
    }

    if (this.config.faceCull) {
      this.webGL.enable(this.webGL.CULL_FACE)
      this.webGL.cullFace(this.webGL[this.config.faceCull])
    } else {
      this.webGL.disable(this.webGL.CULL_FACE)
    }

    this.webGL.frontFace(this.webGL[this.config.frontFace])

    this.webGL.bindFramebuffer(this.webGL.FRAMEBUFFER, this.framebuffer)
    this.webGL.clearColor(0, 0, 0, 1)
    this.webGL.clear(this.webGL.COLOR_BUFFER_BIT | this.webGL.DEPTH_BUFFER_BIT)
    this.textures.forEach(texture => {
      this.webGL.activeTexture(this.webGL.TEXTURE0+texture.unit)
      this.webGL.bindTexture(texture.target, texture.texture)
    })

    this.geometry.drawWith(this.program)

    this.webGL.bindFramebuffer(this.webGL.FRAMEBUFFER, null)
    this.textures.forEach(texture => {
      this.webGL.activeTexture(this.webGL.TEXTURE0+texture.unit)
      this.webGL.bindTexture(texture.target, null)
    })

    return this.attachments.color
  }
}

function createShader(webGL, type, source) {
  let shader = webGL.createShader(webGL[type.toUpperCase()+'_SHADER'])
  webGL.shaderSource(shader, source)
  webGL.compileShader(shader)
  const message = webGL.getShaderInfoLog(shader) || 'Compilation successful'
  if (!webGL.getShaderParameter(shader, webGL.COMPILE_STATUS)) {
    webGL.deleteShader(shader)
    shader = null
  }
  return {shader, message}
}

export default Pass