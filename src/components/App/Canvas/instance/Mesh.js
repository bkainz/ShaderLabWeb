function Mesh(webGL, id, mesh) {
  this.webGL = webGL
  this.id = id
  this.elementBuffer = this.webGL.createBuffer()
  this.elementCount = 0
  this.elementType = this.webGL.TRIANGLES
  // OES_element_index_uint is supported by WebGL 2 by default.
  //this.elementDataType = this.webGL.getExtension('OES_element_index_uint') ? this.webGL.UNSIGNED_INT
  //                                                                         : this.webGL.UNSIGNED_SHORT
  this.elementDataType = this.webGL.UNSIGNED_INT
  this.dataBuffer = this.webGL.createBuffer()
  this.attributes = null
  this.update(mesh)
}

Mesh.prototype = {
  update({data, elements, type, attributes}) {
    // OES_element_index_uint is supported by WebGL 2 by default.
    //const IndexArrayType = this.webGL.getExtension('OES_element_index_uint') ? Uint32Array : Uint16Array
    const IndexArrayType = Uint32Array
    this.webGL.bindBuffer(this.webGL.ELEMENT_ARRAY_BUFFER, this.elementBuffer)
    this.webGL.bufferData(this.webGL.ELEMENT_ARRAY_BUFFER, new IndexArrayType(elements), this.webGL.STATIC_DRAW)
    this.webGL.bindBuffer(this.webGL.ELEMENT_ARRAY_BUFFER, null)

    this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, this.dataBuffer)
    this.webGL.bufferData(this.webGL.ARRAY_BUFFER, data, this.webGL.STATIC_DRAW)
    this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, null)

    this.elementType = this.webGL[type]
    this.elementCount = elements.length
    this.attributes = {}
    if (attributes.vertex) this.attributes.vertexPosition = attributes.vertex
    if (attributes.normal) this.attributes.vertexNormal = attributes.normal
    if (attributes.tCoord) this.attributes.vertexTextureCoordinates = attributes.tCoord
    if (attributes.bCoord) this.attributes.vertexBarycentric = attributes.bCoord
  },

  renderWith(program) {
    for (const name in this.attributes) {
      const location = this.webGL.getAttribLocation(program.webGlProgram, name)
      if (location === -1) continue // does not exist or optimized away during compilation
      this.webGL.enableVertexAttribArray(location)
      this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, this.dataBuffer)
      const attribute = this.attributes[name]
      this.webGL.vertexAttribPointer(location, attribute.count, this.webGL.FLOAT, false, attribute.stride, attribute.offset)
    }
    this.webGL.bindBuffer(this.webGL.ELEMENT_ARRAY_BUFFER, this.elementBuffer)

    this.webGL.drawElements(this.elementType, this.elementCount, this.elementDataType, 0)

    this.webGL.bindBuffer(this.webGL.ELEMENT_ARRAY_BUFFER, null)
    for (const name in this.attributes) {
      const location = this.webGL.getAttribLocation(program.webGlProgram, name)
      if (location === -1) continue // does not exist or optimized away during compilation
      this.webGL.disableVertexAttribArray(location)
      this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, null)
    }
  },

  destroy() {
    this.webGL.deleteBuffer(this.elementBuffer)
    this.webGL.deleteBuffer(this.dataBuffer)
  }
}

export default Mesh