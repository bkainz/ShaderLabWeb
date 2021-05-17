function attributesConfig(v, n, t, b) {
  v = v || 1
  const attributes = {}
  if (v) attributes.vertex = {count: v, offset: 0, stride: (v+n+t+b)*4}
  if (n) attributes.normal = {count: n, offset: v*4, stride: (v+n+t+b)*4}
  if (t) attributes.tCoord = {count: t, offset: (v+n)*4, stride: (v+n+t+b)*4}
  if (b) attributes.bCoord = {count: b, offset: (v+n+t)*4, stride: (v+n+t+b)*4}
  return attributes
}

const meshes = {
  void: {name: 'void',
         data: new Float32Array([]),
         elements: [],
         type: 'TRIANGLES',
         attributes: attributesConfig(1, 0, 0, 0)},
  origin: {name: 'origin',
           data: new Float32Array([
                   0, 0, 0,
                   1, 0, 0,
                   0, 1, 0,
                   0, 0, 1]),
           elements: [0, 1, 0, 2, 0, 3],
           type: 'LINES',
           attributes: attributesConfig(3, 0, 0, 0)},
  quad: {name: 'quad',
         data: new Float32Array([
                 -1, -1,  0, 0, 1,  0, 0,  1, 0, 0,   // bottom left (facing along -z, +y is up)
                 +1, -1,  0, 0, 1,  1, 0,  0, 1, 0,   // bottom right
                 +1, +1,  0, 0, 1,  1, 1,  0, 0, 1,   // top right
                 -1, +1,  0, 0, 1,  0, 1,  0, 1, 0]), // top left
         elements: [0, 1, 2, 2, 3, 0],
         type: 'TRIANGLES',
         attributes: attributesConfig(2, 3, 2, 3)},
  cube: {name: 'cube',
         data: new Float32Array([
                 // +z face
                 -1, -1, +1,  0, 0, +1,  0.25, 0.50,  1, 0, 0, // bottom left (facing along -z, +y is up)
                 +1, -1, +1,  0, 0, +1,  0.50, 0.50,  0, 1, 0, // bottom right
                 +1, +1, +1,  0, 0, +1,  0.50, 0.25,  0, 0, 1, // top right
                 -1, +1, +1,  0, 0, +1,  0.25, 0.25,  0, 1, 0, // top left
                 // -z face
                 +1, -1, -1,  0, 0, -1,  0.75, 0.50,  1, 0, 0, // bottom left (facing along +z, +y is up)
                 -1, -1, -1,  0, 0, -1,  1.00, 0.50,  0, 1, 0, // bottom right
                 -1, +1, -1,  0, 0, -1,  1.00, 0.25,  0, 0, 1, // top right
                 +1, +1, -1,  0, 0, -1,  0.75, 0.25,  0, 1, 0, // top left
                 // +y face
                 -1, +1, +1,  0, +1, 0,  0.25, 0.25,  1, 0, 0, // bottom left (facing along -y, -z is up)
                 +1, +1, +1,  0, +1, 0,  0.50, 0.25,  0, 1, 0, // bottom right
                 +1, +1, -1,  0, +1, 0,  0.50, 0.00,  0, 0, 1, // top right
                 -1, +1, -1,  0, +1, 0,  0.25, 0.00,  0, 1, 0, // top left
                 // -y face
                 -1, -1, -1,  0, -1, 0,  0.25, 0.75,  1, 0, 0, // bottom left (facing along +y, +z is up)
                 +1, -1, -1,  0, -1, 0,  0.50, 0.75,  0, 1, 0, // bottom right
                 +1, -1, +1,  0, -1, 0,  0.50, 0.50,  0, 0, 1, // top right
                 -1, -1, +1,  0, -1, 0,  0.25, 0.50,  0, 1, 0, // top left
                 // +x face
                 +1, -1, +1,  +1, 0, 0,  0.50, 0.50,  1, 0, 0, // bottom left (facing along -x, +y is up)
                 +1, -1, -1,  +1, 0, 0,  0.75, 0.50,  0, 1, 0, // bottom right
                 +1, +1, -1,  +1, 0, 0,  0.75, 0.25,  0, 0, 1, // top right
                 +1, +1, +1,  +1, 0, 0,  0.50, 0.25,  0, 1, 0, // top left
                 // -x face
                 -1, -1, -1,  -1, 0, 0,  0.00, 0.50,  1, 0, 0, // bottom left (facing along +x, +y is up)
                 -1, -1, +1,  -1, 0, 0,  0.25, 0.50,  0, 1, 0, // bottom right
                 -1, +1, +1,  -1, 0, 0,  0.25, 0.25,  0, 0, 1, // top right
                 -1, +1, -1,  -1, 0, 0,  0.00, 0.25,  0, 1, 0  // top left
               ]),
         elements: [ 0,  1,  2,  2,  3,  0,  // +z face
                     4,  5,  6,  6,  7,  4,  // -z face
                     8,  9, 10, 10, 11,  8,  // +y face
                    12, 13, 14, 14, 15, 12,  // -y face
                    16, 17, 18, 18, 19, 16,  // +x face
                    20, 21, 22, 22, 23, 20], // -x face
         type: 'TRIANGLES',
         attributes: attributesConfig(3, 3, 2, 3)},
  get teapot() {
    const path = new URL('assets/teapot.obj', document.baseURI).href
    return fetch(path).then(response => response.text()).then(content => parseWavefront(path, content))
  }
}

function parseWavefront(name, serialized) {
  const vertices = [], normals = [], tCoords = [], bCoords = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 1, 0]], faces = []

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
        faces.push([[values[0], 1], [values[1], 2], [values[2], 3]])
        values.length === 4 && faces.push([[values[2], 3], [values[3], 4], [values[0], 1]]) // quad -> 2nd tri
        break
      default:
        // discard
    }
  }

  const nVertices = vertices.length && vertices[0].length
  const nNormals = normals.length && normals[0].length
  const nTCoords = tCoords.length && tCoords[0].length
  const nBCoords = bCoords.length && bCoords[0].length

  const vertexIndex = {}, data = [], elements = [], size = nVertices+nNormals+nTCoords+nBCoords
  for (let fIdx = 0; fIdx < faces.length; fIdx += 1) {
    for (let vIdx = 0; vIdx < 3; vIdx += 1) {
      const index = faces[fIdx][vIdx][0]+'/'+faces[fIdx][vIdx][1]
      if (!vertexIndex[index]) {
        vertexIndex[index] = data.length/size
        const vtn = faces[fIdx][vIdx][0].split('/'), b = faces[fIdx][vIdx][1]
        if (vertices[vtn[0]-1]) for (let i = 0; i < nVertices; i += 1) data.push(Number(vertices[vtn[0]-1][i]))
        if ( normals[vtn[2]-1]) for (let i = 0; i < nNormals;  i += 1) data.push(Number( normals[vtn[2]-1][i]))
        if ( tCoords[vtn[1]-1]) for (let i = 0; i < nTCoords;  i += 1) data.push(Number( tCoords[vtn[1]-1][i]))
        if ( bCoords[     b-1]) for (let i = 0; i < nBCoords;  i += 1) data.push(Number( bCoords[     b-1][i]))
      }
      elements.push(vertexIndex[index])
    }
  }

  return {name,
          data: new Float32Array(data),
          elements,
          type: 'TRIANGLES',
          attributes: attributesConfig(nVertices, nNormals, nTCoords, nBCoords)}
}

export default function(name, serialized) {
  return serialized ? parseWavefront(name, serialized) : meshes[name] || meshes.void
}