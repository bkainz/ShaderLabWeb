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

function Pass(webGL, key, config, renderToCanvas = false) {
  this.webGL = webGL
  this.key = key
  this.name = config.name
  this.shaders = Object.keys(config.shaders).reduce((shaders, shaderType) => (shaders[shaderType] = null, shaders), {})
  this.program = this.webGL.createProgram()
  this.textureUnits = {}
  this.config = {
    depthTest: '',
    faceCull: '',
    frontFace: 'CCW'
  }
  this.geometry = null

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
                            this.webGL.DEPTH_COMPONENT, this.webGL.UNSIGNED_SHORT, null)
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

        this.textureUnits[name].texture = texture
        this.webGL.uniform1i(location, this.textureUnits[name].unit)
        break
      default:
        throw new Error(`unknown or unsupported uniform type '${type}'`)
    }
  },

  updateTextureUnits(textureUnits) {
    this.textureUnits = textureUnits
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

    for (const uniformName in this.textureUnits) {
      const textureUnit = this.textureUnits[uniformName]
      const target = textureUnit.type === 'sampler2D'   ? this.webGL.TEXTURE_2D
                   : textureUnit.type === 'samplerCube' ? this.webGL.TEXTURE_CUBE_MAP
                   :                                      null
      this.webGL.activeTexture(this.webGL.TEXTURE0+textureUnit.unit)
      this.webGL.bindTexture(target, textureUnit.texture)
    }

    this.geometry.drawWith(this.program)

    this.webGL.bindFramebuffer(this.webGL.FRAMEBUFFER, null)
    for (const uniformName in this.textureUnits) {
      const textureUnit = this.textureUnits[uniformName]
      const target = textureUnit.type === 'sampler2D'   ? this.webGL.TEXTURE_2D
                   : textureUnit.type === 'samplerCube' ? this.webGL.TEXTURE_CUBE_MAP
                   :                                      null
      this.webGL.activeTexture(this.webGL.TEXTURE0+textureUnit.unit)
      this.webGL.bindTexture(target, null)
    }

    return this.attachments.color
  }
}

function Geometry(webGL, {data, elements, attributes}) {
  this.webGL = webGL

  const uintIndexExt = webGL.getExtension('OES_element_index_uint')
  const IndexArrayType = uintIndexExt ? Uint32Array : Uint16Array
  this.elementType = uintIndexExt ? this.webGL.UNSIGNED_INT : this.webGL.UNSIGNED_SHORT
  this.elementCount = elements.length
  this.elementBuffer = this.webGL.createBuffer()
  this.webGL.bindBuffer(this.webGL.ELEMENT_ARRAY_BUFFER, this.elementBuffer)
  this.webGL.bufferData(this.webGL.ELEMENT_ARRAY_BUFFER, new IndexArrayType(elements), this.webGL.STATIC_DRAW)
  this.webGL.bindBuffer(this.webGL.ELEMENT_ARRAY_BUFFER, null)

  this.dataBuffer = this.webGL.createBuffer()
  this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, this.dataBuffer)
  this.webGL.bufferData(this.webGL.ARRAY_BUFFER, data, this.webGL.STATIC_DRAW)
  this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, null)

  this.attributes = {vertex_worldSpace: attributes.vertex,
                     normal_worldSpace: attributes.normal,
                     textureCoordinate_input: attributes.tCoord}
}

Geometry.prototype = {
  drawWith(program) {
    for (const name in this.attributes) {
      const location = this.webGL.getAttribLocation(program, name)
      if (location === -1) continue // does not exist or optimized away during compilation
      this.webGL.enableVertexAttribArray(location)
      this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, this.dataBuffer)
      const attribute = this.attributes[name]
      this.webGL.vertexAttribPointer(location, attribute.count, this.webGL.FLOAT, false, attribute.stride, attribute.offset)
    }
    this.webGL.bindBuffer(this.webGL.ELEMENT_ARRAY_BUFFER, this.elementBuffer)

    this.webGL.drawElements(this.webGL.TRIANGLES, this.elementCount, this.elementType, 0)

    this.webGL.bindBuffer(this.webGL.ELEMENT_ARRAY_BUFFER, null)
    for (const name in this.attributes) {
      const location = this.webGL.getAttribLocation(program, name)
      if (location === -1) continue // does not exist or optimized away during compilation
      this.webGL.disableVertexAttribArray(location)
      this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, null)
    }
  }
}

function Scene(webGL, passes) {
  this.webGL = webGL
  this.passByKey = {}
  for (const passKey in passes) this.passByKey[passKey] = new Pass(webGL, passKey, passes[passKey])
  this.passes = Object.values(this.passByKey)

  this.outputPass = new Pass(webGL, '__output__', {name: 'Output Pass', shaders: {vertex: null, fragment: null}}, true)
  this.outputPass.updateShader({type: 'vertex', linked: true, source: `
attribute vec3 vertex_worldSpace;
attribute vec2 textureCoordinate_input;
varying vec2 uvs;

void main() {
  gl_Position = vec4(vertex_worldSpace, 1.0);
  uvs = textureCoordinate_input;
}`})
  this.outputPass.updateShader({type: 'fragment', linked: true, source: `
precision mediump float;
uniform sampler2D image;
varying vec2 uvs;

void main() {
  gl_FragColor = texture2D(image, uvs.st);
}`})
  this.outputPass.relink()
  this.outputPass.updateTextureUnits({image: {type: 'sampler2D', unit: 0}})
  this.outputPass.updateUniform('sampler2D', 'image', this.passes[this.passes.length-1].attachments.color)
}

Scene.prototype = {
  updateViewport(width, height) {
    this.webGL.viewport(0, 0, width, height)
    this.passes.forEach(pass => pass.updateViewport(width, height))
  },
  draw() {
    this.passes.forEach(pass => pass.draw())
    this.outputPass.draw()
  }
}

function Canvas(el, {props}) {
  this.el = el
  this.props = props
  this.app = el.closest('.App').__component__
  this.app.canvas = this
  this.scene = new Scene(el.getContext('webgl'), props.passes)
}

Canvas.prototype = {
  async initialize() {
    const pass = this.scene.passByKey.base
    for (const bufferKey in pass.attachments) {
      this.app.registerValue(pass.name+' '+bufferKey, 'sampler2D')
      this.app.values.sampler2D[pass.name+' '+bufferKey].value = pass.attachments[bufferKey]
    }

    this.scene.passes.forEach(async pass => {
      const geometry = await this.app.scene.geometry.load(this.props.passes[pass.key].geometry)
      this.app.el.dispatchEvent(new CustomEvent('geometryChanged', {detail: {pass: pass.key, geometry}}))
    })
    this.scene.outputPass.updateGeometry(await this.app.scene.geometry.load('quad'))

    pass.config.depthTest = this.app.values.config['Depth Test'].value
    this.app.values.config['Depth Test'].el.addEventListener('valueChanged', ({detail: depthTest}) => {
      pass.config.depthTest = depthTest
    })

    pass.config.faceCull = this.app.values.config['Face Culling'].value
    this.app.values.config['Face Culling'].el.addEventListener('valueChanged', ({detail: faceCull}) => {
      pass.config.faceCull = faceCull
    })

    pass.config.frontFace = this.app.values.config['Front Face'].value
    this.app.values.config['Front Face'].el.addEventListener('valueChanged', ({detail: frontFace}) => {
      pass.config.frontFace = frontFace
    })
  },

  get size() {
    return {width: this.el.offsetWidth, height: this.el.offsetHeight}
  },

  updateShaders(shaders) {
    this.app.log.append('<hr data-text="Compile & Link Shaders">', '')
    shaders.forEach(shader => {
      const scope = shader.name
      const message = this.scene.passByKey[shader.pass].updateShader(shader)
      this.app.log.append(scope, message)
    })
    for (const passKey in this.scene.passByKey) {
      const scope = this.scene.passByKey[passKey].name
      const message = this.scene.passByKey[passKey].relink()
      this.app.log.append(scope, message)
    }
  },

  updateUniform(uniform) {
    for (const passKey in uniform.passes) {
      this.scene.passByKey[passKey].updateUniform(uniform.type, uniform.name, uniform.value)
    }
  },

  updateTextureUnits(pass, textureUnits) {
    this.scene.passByKey[pass].updateTextureUnits(textureUnits)
  },

  updateGeometry(pass, geometry) {
    const scope = `<hr data-text="Load ${this.scene.passByKey[pass].name} Geometry">`
    const message = geometry.path.split('/').pop()
    this.app.log.append(scope, message)
    this.scene.passByKey[pass].updateGeometry(geometry)
  },

  updateViewport(width, height) {
    this.el.width = width
    this.el.height = height
    this.scene.updateViewport(width, height)
  },

  render() {
    this.scene.draw()
  }
}

module.exports = Canvas