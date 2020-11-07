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

module.exports = Geometry