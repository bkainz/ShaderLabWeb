import loadMesh from '../../../../helpers/loadMesh'

let lastMeshId = 0

function Mesh(webGL) {
  this.id = lastMeshId += 1
  this.webGL = webGL
  this.elementBuffer = this.webGL.createBuffer()
  this.elementCount = 0
  this.elementType = this.webGL.TRIANGLES
  this.elementDataType = this.webGL.getExtension('OES_element_index_uint') ? this.webGL.UNSIGNED_INT
                                                                           : this.webGL.UNSIGNED_SHORT
  this.dataBuffer = this.webGL.createBuffer()
  this.attributes = null
  this.update(loadMesh('void'))
}

Mesh.prototype = {
  update({data, elements, type, attributes}) {
    const IndexArrayType = this.webGL.getExtension('OES_element_index_uint') ? Uint32Array : Uint16Array
    this.webGL.bindBuffer(this.webGL.ELEMENT_ARRAY_BUFFER, this.elementBuffer)
    this.webGL.bufferData(this.webGL.ELEMENT_ARRAY_BUFFER, new IndexArrayType(elements), this.webGL.STATIC_DRAW)
    this.webGL.bindBuffer(this.webGL.ELEMENT_ARRAY_BUFFER, null)

    this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, this.dataBuffer)
    this.webGL.bufferData(this.webGL.ARRAY_BUFFER, data, this.webGL.STATIC_DRAW)
    this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, null)

    this.elementType = this.webGL[type]
    this.elementCount = elements.length
    this.attributes = {}
    if (attributes.vertex) this.attributes.vertex_worldSpace = attributes.vertex
    if (attributes.normal) this.attributes.normal_worldSpace = attributes.normal
    if (attributes.tCoord) this.attributes.textureCoordinate_input = attributes.tCoord
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
  }
}

export default Mesh