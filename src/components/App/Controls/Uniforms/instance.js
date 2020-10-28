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
  this.passes = {}

  this.el = document.createElement('div')
  this.el.classList.add(uniforms.className+'-Uniform')
  this.el.innerHTML = `
<div class="${uniforms.className+'-UniformName'}">${this.name}</div>
<div class="${uniforms.className+'-UniformValue'}"></div>
`.trim()
  this.nameEl = this.el.querySelector(`.${helpers.escapeCSS(uniforms.className)}-UniformName`)
  this.valueEl = this.el.querySelector(`.${helpers.escapeCSS(uniforms.className)}-UniformValue`)
}

Uniform.CONSTRUCTORS = {
  int: NumericUniform,
  ivec2: NumericUniform,
  ivec3: NumericUniform,
  ivec4: NumericUniform,
  bool: NumericUniform,
  bvec2: NumericUniform,
  bvec3: NumericUniform,
  bvec4: NumericUniform,
  float: NumericUniform,
  vec2: NumericUniform,
  vec3: NumericUniform,
  vec4: NumericUniform,
  mat2: NumericUniform,
  mat3: NumericUniform,
  mat4: NumericUniform,
  sampler2D: SamplerUniform,
  samplerCube: SamplerUniform
}

Uniform.prototype = {
  get key() {
    return this.name+'-'+this.type
  },

  get value() {
    return this._value
  },
  set value(value) {
    this._value = value

    const detail = {name: this.name, type: this.type, value: this.value, passes: this.passes}
    this.uniforms.app.el.dispatchEvent(new CustomEvent('uniformChanged', {detail}))
  }
}


function NumericUniform(uniforms, name, type) {
  Uniform.call(this, uniforms, name, type)
  this.id = uniforms.id+'-'+this.key
  this.className = uniforms.className+'/NumericUniform'
  this._value = [...NumericUniform.DEFAULT_VALUES[type]]

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
    rowEl.classList.add(this.className+'-Row')
    this.valueEl.appendChild(rowEl)

    for (let col = 0; col < nCols; col += 1) {
      const index = row*nCols+col
      this.inputEls[index] = document.createElement('input')
      this.inputEls[index].classList.add(this.className+'-Input')
      this.inputEls[index].type = 'number'
      this.inputEls[index].value = this.value[index]
      this.inputEls[index].step = inputStep
      this.inputEls[index].addEventListener('input', e => {
        this._value[index] = Number(this.inputEls[index].value)
        this.value = this._value
      })
      rowEl.appendChild(this.inputEls[index])
    }
  }
}

NumericUniform.DEFAULT_VALUES = {
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
  mat4: [1, 0, 0, 0,  0, 1, 0, 0,   0, 0, 1, 0,  0, 0, 0, 1]
}

NumericUniform.prototype = Object.create(Uniform.prototype, Object.getOwnPropertyDescriptors({
  get value() {
    return this._value
  },
  set value(value) {
    value = Array.isArray(value) ? value : [value]

    for (let idx = 0; idx < value.length; idx += 1)
      this.inputEls[idx].value = Math.round(value[idx]*1000)/1000

    Object.getOwnPropertyDescriptor(Uniform.prototype, 'value').set.call(this, value)
  }
}))


function ImageUpload(uniformsClassName) {
  this.className = uniformsClassName+'/ImageUpload'
  this.el = document.createElement('div')
  this.el.classList.add(this.className)
  this.el.innerHTML = `
<label class="${this.className}-Browse">
  <input type="file" class="${this.className}-File">
  <img src="" class="${this.className}-Preview">
</label>
`.trim()
  this.fileEl = this.el.querySelector(`.${helpers.escapeCSS(this.className)}-File`)
  const previewEl = this.el.querySelector(`.${helpers.escapeCSS(this.className)}-Preview`)

  this.fileEl.addEventListener('change', async e => {
    URL.revokeObjectURL(previewEl.src)
    previewEl.src = URL.createObjectURL(this.file)
  })
}
ImageUpload.prototype = {
  get file() {
    return this.fileEl.files[0]
  },
  get value() {
    if (!this.file) return null
    const image = new Image()
    const loader = new Promise(resolve => {
      image.onload = function() {
        URL.revokeObjectURL(image.src)
        resolve(image)
      }
    })
    image.src = URL.createObjectURL(this.file)
    return loader
  }
}


function SamplerImage(uniform, target, passes = []) {
  this.uniform = uniform
  this.target = target
  this.className = uniform.uniforms.className+'/SamplerImage'

  this.upload = new ImageUpload(uniform.uniforms.className)
  this.colorBuffers = {}
  for (const passKey of passes) {
    const pass = uniform.uniforms.app.canvas.scene.passByKey[passKey]
    for (const bufferKey in pass.attachments)
      this.colorBuffers[passKey+'.'+bufferKey] = {label: pass.name+' '+bufferKey+' Attachment', value: pass.attachments[bufferKey]}
  }

  this.el = document.createElement('div')
  this.el.classList.add(this.className)
  this.el.innerHTML = `
<div class="${this.className}-Value">${Object.keys(this.colorBuffers).length ? `
  <select name="${this.id}-Source" class="${this.className}-Source">
    <option value="upload"${uniform.name === 'textureRendered' ? '' : ' selected'}>Uploaded Image</option>${Object.keys(this.colorBuffers).map(key => `
    <option value="${key}"${uniform.name === 'textureRendered' && key === 'base.color' ? ' selected' : ''}>${this.colorBuffers[key].label}</option>
  `).join('')}
  </select>` : `
  <input type="hidden" name="${this.id}-Source" value="upload" class="${this.className}-Source">`}
  <div class="${this.className}-Upload"></div>
</div>
`.trim()

  this.sourceEl = this.el.querySelector(`.${helpers.escapeCSS(this.className)}-Source`)

  const uploadEl = this.el.querySelector(`.${helpers.escapeCSS(this.className)}-Upload`)
  uploadEl.style.display = this.sourceEl.value === 'upload' ? '' : 'none'
  uploadEl.appendChild(this.upload.el)

  this.sourceEl.addEventListener('change', async e => {
    uploadEl.style.display = this.sourceEl.value === 'upload' ? '' : 'none'
    this.el.dispatchEvent(new CustomEvent('valueChanged', {detail: await this.value}))
  })

  this.upload.fileEl.addEventListener('change', async e => {
    this.el.dispatchEvent(new CustomEvent('valueChanged', {detail: await this.value}))
  })
}
SamplerImage.prototype = {
  get value() {
    return this.sourceEl.value === 'upload' ? this.upload.value : this.colorBuffers[this.sourceEl.value].value
  }
}


function SamplerUniform(uniforms, name, type) {
  Uniform.call(this, uniforms, name, type)
  this.id = uniforms.id+'-'+this.key
  this.className = uniforms.className+'/SamplerUniform'
  this._value = {...SamplerUniform.DEFAULT_VALUES[type]}

  this.imagesEl = document.createElement('div')
  this.imagesEl.classList.add(this.className+'-Images')
  this.valueEl.appendChild(this.imagesEl)

  this.images = {...SamplerUniform.DEFAULT_VALUES[type]}
  for (const target in this.images) {
    const imageEl = document.createElement('div')
    imageEl.classList.add(this.className+'-Image', target)
    this.imagesEl.appendChild(imageEl)

    const image = new SamplerImage(this, target, type === 'sampler2D' ? ['base'] : undefined)
    image.el.addEventListener('valueChanged', ({detail: imageValue}) => {
      const value = this.value
      value[image.target] = imageValue
      this.value = value
    })
    imageEl.appendChild(image.el)

    this.images[target] = image
  }

  const value = {}
  const gatherValue = Object.keys(this.images).map(async target => value[target] = await this.images[target].value)
  Promise.all(gatherValue).then(() => this.value = value)
}
SamplerUniform.DEFAULT_VALUES = {
  sampler2D: {
    TEXTURE_2D: null
  },
  samplerCube: {
    TEXTURE_CUBE_MAP_POSITIVE_X: null,
    TEXTURE_CUBE_MAP_NEGATIVE_X: null,
    TEXTURE_CUBE_MAP_POSITIVE_Y: null,
    TEXTURE_CUBE_MAP_NEGATIVE_Y: null,
    TEXTURE_CUBE_MAP_POSITIVE_Z: null,
    TEXTURE_CUBE_MAP_NEGATIVE_Z: null
  }
}
SamplerUniform.prototype = Object.create(Uniform.prototype)


function Uniforms(el, {id, className}) {
  this.el = el
  this.id = id
  this.className = className
  this.app = el.closest('.App').__component__
  this.app.uniforms = this

  this.state = {}
  this.defaultState = {}

  const mvMatrix = new NumericUniform(this, 'mvMatrix', 'mat4')
  mvMatrix.value = M(T(0, -8, -40), R(-90, 1, 0, 0))
  this.defaultState[mvMatrix.key] = mvMatrix

  const pMatrix = new NumericUniform(this, 'pMatrix', 'mat4')
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
      const textureUnits = {}
      const currentTextureUnitByType = {}
      shaders.forEach(shader => {
        textureUnits[shader.pass] = textureUnits[shader.pass] || {}
        let match
        while (match = rUniform.exec(shader.source)) {
          const name = match[2]
          const type = match[1]
          const key = name+'-'+type
          this.state[key] = this.defaultState[key] || oldState[key] || new Uniform.CONSTRUCTORS[type](this, name, type)
          this.state[key].passes[shader.pass] = true

          if (type.startsWith('sampler')) {
            currentTextureUnitByType[type] = currentTextureUnitByType[type] || 0
            textureUnits[shader.pass][name] = {type, unit: currentTextureUnitByType[type]}
            currentTextureUnitByType[type] += 1
          }
        }
      })

      for (const pass in textureUnits)
        this.app.el.dispatchEvent(new CustomEvent('textureUnitsChanged', {detail: {pass, textureUnits: textureUnits[pass]}}))

      this.el.innerHTML = ''
      Object.values(this.state).forEach(uniform => {
        this.el.appendChild(uniform.el)
        uniform.value = uniform.value
      })
    })
  }
}

module.exports = Uniforms