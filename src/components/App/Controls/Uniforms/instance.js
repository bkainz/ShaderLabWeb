function M(a, b) {
  const c00 = a[0]*b[0]  + a[4]*b[1]  + a[8] *b[2]  + a[12]*b[3] ,
        c01 = a[1]*b[0]  + a[5]*b[1]  + a[9] *b[2]  + a[13]*b[3] ,
        c02 = a[2]*b[0]  + a[6]*b[1]  + a[10]*b[2]  + a[14]*b[3] ,
        c03 = a[3]*b[0]  + a[7]*b[1]  + a[11]*b[2]  + a[15]*b[3] ,
        c04 = a[0]*b[4]  + a[4]*b[5]  + a[8] *b[6]  + a[12]*b[7] ,
        c05 = a[1]*b[4]  + a[5]*b[5]  + a[9] *b[6]  + a[13]*b[7] ,
        c06 = a[2]*b[4]  + a[6]*b[5]  + a[10]*b[6]  + a[14]*b[7] ,
        c07 = a[3]*b[4]  + a[7]*b[5]  + a[11]*b[6]  + a[15]*b[7] ,
        c08 = a[0]*b[8]  + a[4]*b[9]  + a[8] *b[10] + a[12]*b[11],
        c09 = a[1]*b[8]  + a[5]*b[9]  + a[9] *b[10] + a[13]*b[11],
        c10 = a[2]*b[8]  + a[6]*b[9]  + a[10]*b[10] + a[14]*b[11],
        c11 = a[3]*b[8]  + a[7]*b[9]  + a[11]*b[10] + a[15]*b[11],
        c12 = a[0]*b[12] + a[4]*b[13] + a[8] *b[14] + a[12]*b[15],
        c13 = a[1]*b[12] + a[5]*b[13] + a[9] *b[14] + a[13]*b[15],
        c14 = a[2]*b[12] + a[6]*b[13] + a[10]*b[14] + a[14]*b[15],
        c15 = a[3]*b[12] + a[7]*b[13] + a[11]*b[14] + a[15]*b[15]
  return [c00, c01, c02, c03,
          c04, c05, c06, c07,
          c08, c09, c10, c11,
          c12, c13, c14, c15]
}

function R(angle, x, y, z) {
  const len = Math.sqrt(x*x + y*y + z*z); x /= len; y /= len; z /= len
  const sin = Math.sin(angle/180*Math.PI), cos = Math.cos(angle/180*Math.PI)
  return [x*x*(1-cos) +   cos, y*x*(1-cos) + z*sin, z*x*(1-cos) - y*sin, 0,
          x*y*(1-cos) - z*sin, y*y*(1-cos) +   cos, z*y*(1-cos) + x*sin, 0,
          x*z*(1-cos) + y*sin, y*z*(1-cos) - x*sin, z*z*(1-cos) +   cos, 0,
                            0,                   0,                   0, 1]
}

function T(x, y, z) {
  return [1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          x, y, z, 1]
}

function P(fov, aspect, near, far) {
  const f = Math.tan(Math.PI * 0.5 - 0.5 * fov*180/Math.PI)
  return [f/aspect, 0, 0, 0,
          0, f, 0, 0,
          0, 0, (near+far) / (near-far), -1,
          0, 0, near*far / (near-far) * 2, 0]
}


function Uniform(uniforms, name, type) {
  this.uniforms = uniforms
  this.name = name
  this.type = type
  this._value = Uniform.DEFAULT_VALUES[type]
  this.passes = {}

  this.el = document.createElement('div')
  this.el.classList.add(uniforms.className+'-Uniform')

  this.nameEl = document.createElement('div')
  this.nameEl.classList.add(uniforms.className+'-UniformName')
  this.nameEl.innerHTML = this.name
  this.el.appendChild(this.nameEl)

  this.valueEl = document.createElement('div')
  this.valueEl.classList.add(uniforms.className+'-UniformValue')
  this.el.appendChild(this.valueEl)

  if (type.startsWith('sampler')) {
    this.valueEl.innerHTML = this.value
    return
  }

  const nRows = type.startsWith('mat')  ? Number(type[3]) : 1
  const nCols = type.startsWith('mat')  ? Number(type[3])
              : type.startsWith('vec')  ? Number(type[3])
              : type.startsWith('ivec') ? Number(type[4])
              : type.startsWith('bvec') ? Number(type[4])
              :                           1
  const inputStep = type.startsWith('mat')   ? 'any'
                  : type.startsWith('vec')   ? 'any'
                  : type.startsWith('float') ? 'any'
                  :                            '1'

  this.inputEls = []
  for (let row = 0; row < nRows; row += 1) {
    const rowEl = document.createElement('div')
    rowEl.classList.add(uniforms.className+'-UniformValueRow')
    this.el.appendChild(rowEl)

    for (let col = 0; col < nCols; col += 1) {
      const index = row*nCols+col
      this.inputEls[index] = document.createElement('input')
      this.inputEls[index].classList.add(uniforms.className+'-UniformInput')
      this.inputEls[index].type = 'number'
      this.inputEls[index].value = this.value[index]
      this.inputEls[index].step = inputStep
      this.inputEls[index].addEventListener('input', e => {
        this._value[index] = Number(this.inputEls[index].value)
        this.triggerChange()
      })
      rowEl.appendChild(this.inputEls[index])
    }
  }
}

Uniform.DEFAULT_VALUES = {
  int: [0],
  ivec2: [0, 0],
  ivec3: [0, 0, 0],
  ivec4: [0, 0, 0, 0],
  bool: [0],
  bvec2: [0, 0],
  bvec3: [0, 0, 0],
  bvec4: [0, 0, 0, 0],
  float: [0],
  vec2: [0, 0],
  vec3: [0, 0, 0],
  vec4: [0, 0, 0, 0],
  mat2: [1, 0,  0, 1],
  mat3: [1, 0, 0,  0, 1, 0,  0, 0, 1],
  mat4: [1, 0, 0, 0,  0, 1, 0, 0,   0, 0, 1, 0,  0, 0, 0, 1],
  sampler2D: 'samplers not supported yet',
  samplerCube: 'samplers not supported yet'
}

Uniform.prototype = {
  get key() {
    return this.name+'-'+this.type
  },

  get value() {
    return this._value
  },
  set value(value) {
    this._value = Array.isArray(value) ? value : [value]

    for (let idx = 0; idx < this._value.length; idx += 1)
      this.inputEls[idx].value = Math.round(this._value[idx]*1000)/1000

    this.triggerChange()
  },

  triggerChange() {
    const detail = {name: this.name, type: this.type, value: this.value, passes: this.passes}
    this.uniforms.app.el.dispatchEvent(new CustomEvent('uniformChanged', {detail}))
  }
}

function Uniforms(el, {id, className}) {
  this.el = el
  this.id = id
  this.className = className
  this.app = el.closest('.App').__component__
  this.app.uniforms = this

  this.state = {}
  this.defaultState = {}

  const mvMatrix = new Uniform(this, 'mvMatrix', 'mat4')
  mvMatrix.value = M(T(0, -8, -40), R(-90, 1, 0, 0))
  this.defaultState[mvMatrix.key] = mvMatrix

  const pMatrix = new Uniform(this, 'pMatrix', 'mat4')
  this.defaultState[pMatrix.key] = pMatrix
}

Uniforms.prototype = {
  initialize() {
    this.app.el.addEventListener('viewportChanged', ({detail: {width, height}}) => {
      this.state['pMatrix-mat4'].value = P(60, width/height, 0.001, 10000)
    })

    this.app.el.addEventListener('shadersChanged', ({detail: shaders}) => {
      const oldState = this.state
      this.state = {}

      const rUniform = /uniform\s+(\S+)\s+(\S+);/g
      shaders.forEach(shader => {
        let match
        while (match = rUniform.exec(shader.source)) {
          const name = match[2]
          const type = match[1]
          const key = name+'-'+type
          this.state[key] = this.defaultState[key] || oldState[key] || new Uniform(this, name, type)
          this.state[key].passes[shader.pass] = true
        }
      })

      this.el.innerHTML = ''
      Object.values(this.state).forEach(uniform => {
        this.el.appendChild(uniform.el)
        uniform.triggerChange()
      })
    })
  }
}

module.exports = Uniforms