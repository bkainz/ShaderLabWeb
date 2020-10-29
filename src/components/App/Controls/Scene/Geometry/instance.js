function normalize(v) {
  let sum = 0; for (let i = 0; i < v.length; i+=1) sum += v[i]*v[i]
  const len = Math.sqrt(sum)
  const n = []; for (let i = 0; i < v.length; i+=1) n[i] = v[i]/len
  return n
}

const load = {
  void() {
    return {path: 'void',
            data: new Float32Array([]),
            elements: [],
            attributes: {}}
  },
  quad() {
    const size = {v: 2, n: 3, t: 2}
    const stride = (size.v+size.n+size.t)*4
    return {path: 'quad',
            data: new Float32Array([
                   -1, +1,  0, 0, -1,  0, 1,   // top left (vertex(2), normal(3), UV(2))
                   +1, +1,  0, 0, -1,  1, 1,   // top right
                   +1, -1,  0, 0, -1,  1, 0,   // bottom right
                   -1, -1,  0, 0, -1,  0, 0]), // bottom left
            elements: [0, 1, 2, 2, 3, 0],
            attributes: {vertex: {count: size.v, offset: 0, stride: stride},
                         normal: {count: size.n, offset: size.v*4, stride},
                         tCoord: {count: size.t, offset: (size.v+size.n)*4, stride}}}
  },
  async wavefront(path) {
    const fullPath = new URL(path, document.baseURI).href
    const fileContent = await fetch(fullPath).then(response => response.text())

    const vertices = [], normals = [], tCoords = [], faces = []
    for (const line of fileContent.split('\n')) {
      const values = line.trim().split(/\s+/)
      const type = values.shift()
      if (type === 'v' )
        vertices.push(values.map(Number))
      else if (type === 'vn')
        normals.push(normalize(values.map(Number)))
      else if (type === 'vt')
        tCoords.push([Number(values[0]), Number(values[1])])
      else if (type === 'f')
        values.length === 4 ? faces.push([values[0], values[1], values[2]], [values[0], values[2], values[3]]) // quad -> 2 tris
                            : faces.push(values) // tri
    }

    const size = {v: vertices[0].length,
                  n: normals[0].length,
                  t: tCoords[0].length}

    const vertexIndex = {}, data = [], elements = []
    for (const face of faces) {
      for (const index of face) {
        if (!vertexIndex[index]) {
          vertexIndex[index] = data.length/(size.v+size.n+size.t)
          const [vIdx, txIdx, nIdx] = index.split('/').map(Number)
          data.push(...vertices[vIdx-1], ...normals[nIdx-1], ...tCoords[txIdx-1])
        }
        elements.push(vertexIndex[index])
      }
    }

    const stride = (size.v+size.n+size.t)*4
    return {path,
            data: new Float32Array(data),
            elements,
            attributes: {vertex: {count: size.v, offset: 0, stride},
                         normal: {count: size.n, offset: size.v*4, stride},
                         tCoord: {count: size.t, offset: (size.v+size.n)*4, stride}}}
  }
}

function Geometry(el, {className}) {
  this.el = el
  this.scene = el.closest('.'+helpers.escapeCSS(className.split('/').slice(0, -1).join('/'))).__component__
  this.scene.geometry = this
}

Geometry.prototype = {
  async load(path) {
    return path === 'void' ? load.void()
         : path === 'quad' ? load.quad()
         :                   await load.wavefront(path)
  }
}

module.exports = Geometry