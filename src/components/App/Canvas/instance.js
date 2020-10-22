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

function Stage(webGL, key) {
  this.webGL = webGL
  this.name = key[0].toUpperCase()+key.slice(1)+' Stage'
  this.program = this.webGL.createProgram()
  this.shaders = {}
  this.geometry = null
}

Stage.prototype = {
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
  enableAttribute(attribute) {
    const location = this.webGL.getAttribLocation(this.program, attribute.name)
    if (location === -1) return // does not exist or optimized away during compilation
    this.webGL.enableVertexAttribArray(location)
    this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, attribute.buffer)
    this.webGL.vertexAttribPointer(location, attribute.elementSize, attribute.elementType, false, 0, 0)
  },
  relink() {
    this.webGL.linkProgram(this.program)
    return this.webGL.getProgramInfoLog(this.program) || 'Linking successful'
  },
  setUniform(type, name, ...values) {
    this.webGL['uniform'+type](this.webGL.getUniformLocation(this.program, name), ...values)
  },
  draw(prepare) {
    if (!this.webGL.getProgramParameter(this.program, this.webGL.LINK_STATUS) || !this.geometry) return

    this.webGL.useProgram(this.program)
    const framebuffer = prepare()
    this.webGL.bindFramebuffer(this.webGL.FRAMEBUFFER, framebuffer)
    this.webGL.enable(this.webGL.DEPTH_TEST)
    this.webGL.clearColor(0, 0, 0, 0)
    this.webGL.clear(this.webGL.COLOR_BUFFER_BIT | this.webGL.DEPTH_BUFFER_BIT)
    this.geometry.drawWith(this.program)
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

  this.dataBuffer = this.webGL.createBuffer()
  this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, this.dataBuffer)
  this.webGL.bufferData(this.webGL.ARRAY_BUFFER, data, this.webGL.STATIC_DRAW)

  this.attributes = {vertex_worldSpace: attributes.vertex,
                     normal_worldSpace: attributes.normal,
                     textureCoordinate_input: attributes.tCoord}
}

Geometry.prototype = {
  drawWith(program) {
    for (const name in this.attributes) {
      const attribute = this.attributes[name]
      const location = this.webGL.getAttribLocation(program, name)
      if (location === -1) continue // does not exist or optimized away during compilation
      this.webGL.enableVertexAttribArray(location)
      this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, this.dataBuffer)
      this.webGL.vertexAttribPointer(location, attribute.count, this.webGL.FLOAT, false, attribute.stride, attribute.offset)
    }
    this.webGL.bindBuffer(this.webGL.ELEMENT_ARRAY_BUFFER, this.elementBuffer)
    this.webGL.drawElements(this.webGL.TRIANGLES, this.elementCount, this.elementType, 0)
  }
}

function Scene(webGL, shaders) {
  this.webGL = webGL
  this.stages = shaders.reduce((stages, shader) => {
                  stages[shader.stage] = stages[shader.stage] || new Stage(webGL, shader.stage)
                  stages[shader.stage].shaders[shader.type] = null
                  return stages
                }, {})
}

Scene.prototype = {
  updateViewport(width, height) {
    this.webGL.viewport(0, 0, width, height)
    this.renderedTexture = this.webGL.createTexture()
    this.webGL.bindTexture(this.webGL.TEXTURE_2D, this.renderedTexture)
    this.webGL.texImage2D(this.webGL.TEXTURE_2D, 0, this.webGL.RGBA,
                          width, height, 0,
                          this.webGL.RGBA, this.webGL.UNSIGNED_BYTE, null)
    this.webGL.texParameteri(this.webGL.TEXTURE_2D, this.webGL.TEXTURE_MIN_FILTER, this.webGL.LINEAR)
    this.webGL.texParameteri(this.webGL.TEXTURE_2D, this.webGL.TEXTURE_WRAP_S, this.webGL.CLAMP_TO_EDGE)
    this.webGL.texParameteri(this.webGL.TEXTURE_2D, this.webGL.TEXTURE_WRAP_T, this.webGL.CLAMP_TO_EDGE)

    this.baseFramebuffer = this.webGL.createFramebuffer()
    this.webGL.bindFramebuffer(this.webGL.FRAMEBUFFER, this.baseFramebuffer)
    this.webGL.framebufferTexture2D(this.webGL.FRAMEBUFFER, this.webGL.COLOR_ATTACHMENT0, this.webGL.TEXTURE_2D, this.renderedTexture, 0)
    const depthBuffer = this.webGL.createRenderbuffer()
    this.webGL.bindRenderbuffer(this.webGL.RENDERBUFFER, depthBuffer)
    this.webGL.renderbufferStorage(this.webGL.RENDERBUFFER, this.webGL.DEPTH_COMPONENT16, width, height)
    this.webGL.framebufferRenderbuffer(this.webGL.FRAMEBUFFER, this.webGL.DEPTH_ATTACHMENT, this.webGL.RENDERBUFFER, depthBuffer)
  },
  draw() {
    const width = this.webGL.canvas.width
    const height = this.webGL.canvas.height

    this.stages.base.draw(() => {
      const deg = 90
      const sin = Math.sin(deg/180*Math.PI)
      const cos = Math.cos(deg/180*Math.PI)
      this.stages.base.setUniform('Matrix4fv', 'mvMatrix', false, [1, 0, 0, 0,  0, cos, -sin, 0,  0, sin, cos, 0,  0, -8, -40, 1])

      function perspective(fov, aspect, near, far) {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fov*180/Math.PI)
        return [f/aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (near+far) / (near-far), -1,
                0, 0, near*far / (near-far) * 2, 0]
      }
      this.stages.base.setUniform('Matrix4fv', 'pMatrix', false, perspective(60, width/height, 0.001, 10000))
      return this.baseFramebuffer
    })

    this.stages.R2T.draw(() => {
      this.webGL.bindTexture(this.webGL.TEXTURE_2D, this.renderedTexture)
      return null // render to canvas
    })
  }
}

function Canvas(el, {props}) {
  this.el = el
  this.app = el.closest('.App').__component__
  this.app.canvas = this
  this.scene = new Scene(el.getContext('webgl'), props.shaders)
}

Canvas.prototype = {
  initialize() {
    // nothing to do
  },

  get size() {
    return {width: this.el.offsetWidth, height: this.el.offsetHeight}
  },

  updateShaders(shaders) {
    this.app.log.append('<hr data-text="Compile & Link Shaders">', '')
    shaders.forEach(shader => {
      const scope = shader.name
      const message = this.scene.stages[shader.stage].updateShader(shader)
      this.app.log.append(scope, message)
    })
    for (const stageKey in this.scene.stages) {
      const scope = this.scene.stages[stageKey].name
      const message = this.scene.stages[stageKey].relink()
      this.app.log.append(scope, message)
    }
  },

  updateGeometry(stage, object) {
    const scope = `<hr data-text="Load ${this.scene.stages[stage].name} Geometry">`
    const message = object.path.split('/').pop()
    this.app.log.append(scope, message)
    this.scene.stages[stage].geometry = new Geometry(this.scene.webGL, object)
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