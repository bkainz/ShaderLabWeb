function Framebuffer(webGL) {
  this.webGL = webGL

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

Framebuffer.prototype = {
  updateViewport(width, height) {
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

  render(model) {
    this.webGL.bindFramebuffer(this.webGL.FRAMEBUFFER, this.framebuffer)
    this.webGL.clearColor(0, 0, 0, 1)
    this.webGL.clear(this.webGL.COLOR_BUFFER_BIT | this.webGL.DEPTH_BUFFER_BIT)

    model.render()

    this.webGL.bindFramebuffer(this.webGL.FRAMEBUFFER, null)
    return this.attachments.color
  }
}

export default Framebuffer