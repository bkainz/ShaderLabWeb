import geometryHelper from '../../../../helpers/geometry'

function Model(canvas) {
  this.canvas = canvas
  this.webGL = canvas.webGL
  this.elementBuffer = this.webGL.createBuffer()
  this.elementCount = 0
  this.elementType = this.webGL.getExtension('OES_element_index_uint') ? this.webGL.UNSIGNED_INT
                                                                       : this.webGL.UNSIGNED_SHORT
  this.dataBuffer = this.webGL.createBuffer()
  this.attributes = {vertex_worldSpace: {count: 1, offset: 0, stride: 0}}
  this.updateVertices(geometryHelper.void)
}

Model.prototype = {
  updateVertices({data, elements, attributes}) {
    const IndexArrayType = this.webGL.getExtension('OES_element_index_uint') ? Uint32Array : Uint16Array
    this.webGL.bindBuffer(this.webGL.ELEMENT_ARRAY_BUFFER, this.elementBuffer)
    this.webGL.bufferData(this.webGL.ELEMENT_ARRAY_BUFFER, new IndexArrayType(elements), this.webGL.STATIC_DRAW)
    this.webGL.bindBuffer(this.webGL.ELEMENT_ARRAY_BUFFER, null)

    this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, this.dataBuffer)
    this.webGL.bufferData(this.webGL.ARRAY_BUFFER, data, this.webGL.STATIC_DRAW)
    this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, null)

    this.elementCount = elements.length
    this.attributes = {vertex_worldSpace: attributes.vertex,
                       normal_worldSpace: attributes.normal,
                       textureCoordinate_input: attributes.tCoord}
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

    this.webGL.drawElements(this.webGL.TRIANGLES, this.elementCount, this.elementType, 0)

    this.webGL.bindBuffer(this.webGL.ELEMENT_ARRAY_BUFFER, null)
    for (const name in this.attributes) {
      const location = this.webGL.getAttribLocation(program.webGlProgram, name)
      if (location === -1) continue // does not exist or optimized away during compilation
      this.webGL.disableVertexAttribArray(location)
      this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, null)
    }
  }
}

export default Model