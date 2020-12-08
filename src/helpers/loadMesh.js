function attributesConfig(v, n, t) {
  v = v || 1
  const attributes = {}
  if (v) attributes.vertex = {count: v, offset: 0, stride: (v+n+t)*4}
  if (n) attributes.normal = {count: n, offset: v*4, stride: (v+n+t)*4}
  if (t) attributes.tCoord = {count: t, offset: (v+n)*4, stride: (v+n+t)*4}
  return attributes
}

const meshes = {
  void: {name: 'void',
         data: new Float32Array([]),
         elements: [],
         type: 'TRIANGLES',
         attributes: attributesConfig(1, 0, 0)},
  origin: {name: 'origin',
           data: new Float32Array([
                   0, 0, 0,
                   1, 0, 0,
                   0, 1, 0,
                   0, 0, 1]),
           elements: [0, 1, 0, 2, 0, 3],
           type: 'LINES',
           attributes: attributesConfig(3, 0, 0)},
  quad: {name: 'quad',
         data: new Float32Array([
                 -1, -1,  0, 0, 1,  0, 0,   // bottom left (facing along -z, +y is up)
                 +1, -1,  0, 0, 1,  1, 0,   // bottom right
                 +1, +1,  0, 0, 1,  1, 1,   // top right
                 -1, +1,  0, 0, 1,  0, 1]), // top left
         elements: [0, 1, 2, 2, 3, 0],
         type: 'TRIANGLES',
         attributes: attributesConfig(2, 3, 2)},
  get teapot() {
    const path = new URL('assets/teapot.obj', document.baseURI).href
    return fetch(path).then(response => response.text()).then(content => parseWavefront(path, content))
  }
}

function parseWavefront(name, serialized) {
  const vertices = [], normals = [], tCoords = [], faces = []
  const lines = serialized.split(/\n/g)
  for (let lIdx = 0; lIdx < lines.length; lIdx += 1) {
    const values = lines[lIdx].trim().split(/\s+/g)
    switch (values.shift()) {
      case 'vn':
        normals.push(values)
        break
      case 'vt':
        tCoords.push(values)
        break
      case 'v':
        vertices.push(values)
        break
      case 'f':
        values.length === 4 ? faces.push([values[0], values[1], values[2]], [values[0], values[2], values[3]]) // quad -> 2 tris
                            : faces.push(values) // tri
        break
      default:
        // discard
    }
  }

  const nVertices = vertices.length && vertices[0].length
  const nNormals = normals.length && normals[0].length
  const nTCoords = tCoords.length && tCoords[0].length

  const vertexIndex = {}, data = [], elements = [], size = nVertices+nNormals+nTCoords
  for (let fIdx = 0; fIdx < faces.length; fIdx += 1) {
    for (let vIdx = 0; vIdx < 3; vIdx += 1) {
      const index = faces[fIdx][vIdx]
      if (!vertexIndex[index]) {
        vertexIndex[index] = data.length/size
        const vtn = index.split('/')
        if (vertices[vtn[0]-1]) for (let i = 0; i < nVertices; i += 1) data.push(Number(vertices[vtn[0]-1][i]))
        if ( normals[vtn[2]-1]) for (let i = 0; i < nNormals;  i += 1) data.push(Number( normals[vtn[2]-1][i]))
        if ( tCoords[vtn[1]-1]) for (let i = 0; i < nTCoords;  i += 1) data.push(Number( tCoords[vtn[1]-1][i]))
      }
      elements.push(vertexIndex[index])
    }
  }

  return {name,
          data: new Float32Array(data),
          elements,
          type: 'TRIANGLES',
          attributes: attributesConfig(nVertices, nNormals, nTCoords)}
}

export default function(name, serialized) {
  return serialized ? parseWavefront(name, serialized) : meshes[name] || meshes.void
}