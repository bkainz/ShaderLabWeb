import escapeCSS from '../../../../helpers/escapeCSS'
import algebra from '../../../../helpers/algebra'

const {R} = algebra

function P(fov, aspect, near, far) {
  const f = Math.tan(Math.PI * 0.5 - 0.5 * fov*180/Math.PI)
  return [f/aspect, 0, 0, 0,
          0, f, 0, 0,
          0, 0, (near+far) / (near-far), -1,
          0, 0, near*far / (near-far) * 2, 0]
}


function Uniform(uniforms, name, type, defaultAttachment) {
  this.uniforms = uniforms
  this.name = name
  this.type = type
  this.passes = {}
  this.id = uniforms.id+'-'+this.key
  this.className = uniforms.className+'/Uniform'

  this.el = document.createElement('div')
  this.el.classList.add(this.className)
  this.el.innerHTML = `
<div class="${this.className+'-Name'}">${this.name}</div>
<div class="${this.className+'-Value'}"></div>
`.trim()
  this.nameEl = this.el.querySelector(`.${escapeCSS(this.className)}-Name`)
  this.valueEl = this.el.querySelector(`.${escapeCSS(this.className)}-Value`)

  const attachments = uniforms.app.values[type] || {}
  this.valueEl.innerHTML = Object.keys(attachments).length ? `
attach to: <select name="${this.id}-Attachment" class="${this.className}-Attachment">
  <option value="">None</option>${Object.keys(attachments).map(name => `
  <option value="${name}"${name === defaultAttachment ? ' selected' : ''}>${name}</option>`).join('')}
</select>`.trim() : `
<input type="hidden" name="${this.id}-Attachment" value="" class="${this.className}-Attachment">`.trim()

  this._attachmentChangeListener = (({detail: value}) => this.value = value)
  this.attachmentEl = this.el.querySelector(`.${escapeCSS(this.className)}-Attachment`)
  this.attachmentEl.addEventListener('change', e => this.attachment = this.attachmentEl.value)
  this.el.addEventListener('attachmentChanged', ({detail: attachment}) => this.attachmentEl.value = attachment)
  this.attachment = this.attachmentEl.value
}

Uniform.TYPES = {
  int: {constructor: NumericUniform, default: [0]},
  ivec2: {constructor: NumericUniform, default: [0, 0]},
  ivec3: {constructor: NumericUniform, default: [0, 0, 0]},
  ivec4: {constructor: NumericUniform, default: [0, 0, 0, 0]},
  bool: {constructor: NumericUniform, default: [0]},
  bvec2: {constructor: NumericUniform, default: [0, 0]},
  bvec3: {constructor: NumericUniform, default: [0, 0, 0]},
  bvec4: {constructor: NumericUniform, default: [0, 0, 0, 0]},
  float: {constructor: NumericUniform, default: [0]},
  vec2: {constructor: NumericUniform, default: [0, 0]},
  vec3: {constructor: NumericUniform, default: [0, 0, 0]},
  vec4: {constructor: NumericUniform, default: [0, 0, 0, 0]},
  mat2: {constructor: NumericUniform, default: [1, 0,
                                                0, 1]},
  mat3: {constructor: NumericUniform, default: [1, 0, 0,
                                                0, 1, 0,
                                                0, 0, 1]},
  mat4: {constructor: NumericUniform, default: [1, 0, 0, 0,
                                                0, 1, 0, 0,
                                                0, 0, 1, 0,
                                                0, 0, 0, 1]},
  sampler2D: {constructor: SamplerUniform, default: {TEXTURE_2D: null}},
  samplerCube: {constructor: SamplerUniform, default: {TEXTURE_CUBE_MAP_POSITIVE_X: null,
                                                       TEXTURE_CUBE_MAP_NEGATIVE_X: null,
                                                       TEXTURE_CUBE_MAP_POSITIVE_Y: null,
                                                       TEXTURE_CUBE_MAP_NEGATIVE_Y: null,
                                                       TEXTURE_CUBE_MAP_POSITIVE_Z: null,
                                                       TEXTURE_CUBE_MAP_NEGATIVE_Z: null}}
}

Uniform.prototype = {
  get key() {
    return this.name+'-'+this.type
  },

  get attachment() {
    return this._attachment
  },
  set attachment(attachment) {
    const attachments = this.uniforms.app.values[this.type]

    if (this._attachment) attachments[this._attachment].el.removeEventListener('valueChanged', this._attachmentChangeListener)
    this._attachment = attachment
    if (this._attachment) attachments[this._attachment].el.addEventListener('valueChanged', this._attachmentChangeListener)

    this.el.dispatchEvent(new CustomEvent('attachmentChanged', {detail: attachment}))

    this.value = attachment ? attachments[attachment].value
               : this.value ? this.value
               :              Array.isArray(Uniform.TYPES[this.type].default) ? [...Uniform.TYPES[this.type].default]
                                                                              : {...Uniform.TYPES[this.type].default}
  },

  get value() {
    return this._value
  },
  set value(value) {
    this._value = value
    this.el.dispatchEvent(new CustomEvent('valueChanged', {detail: value}))

    const detail = {name: this.name, type: this.type, value, passes: this.passes}
    this.uniforms.app.el.dispatchEvent(new CustomEvent('uniformChanged', {detail}))
  }
}


function NumericUniform(uniforms, name, type, defaultAttachment) {
  Uniform.call(this, uniforms, name, type, defaultAttachment)
  this.className = uniforms.className+'/NumericUniform'

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

  this.el.addEventListener('valueChanged', ({detail: value}) => {
    for (let idx = 0; idx < value.length; idx += 1)
      this.inputEls[idx].value = Math.round(value[idx]*1000)/1000
  })
}

NumericUniform.prototype = Object.create(Uniform.prototype, Object.getOwnPropertyDescriptors({
  get value() {
    return this._value
  },
  set value(value) {
    value = Array.isArray(value) ? value : [value]
    Object.getOwnPropertyDescriptor(Uniform.prototype, 'value').set.call(this, value)
  }
}))


function ImageUpload(uniformsClassName, target) {
  this.className = uniformsClassName+'/ImageUpload'
  this.el = document.createElement('div')
  this.el.classList.add(this.className, target)
  this.el.innerHTML = `
<label class="${this.className}-Browse">
  <input type="file" class="${this.className}-File">
  <img src="" class="${this.className}-Preview">
</label>
`.trim()
  this.fileEl = this.el.querySelector(`.${escapeCSS(this.className)}-File`)
  const previewEl = this.el.querySelector(`.${escapeCSS(this.className)}-Preview`)

  this.fileEl.addEventListener('change', async e => {
    URL.revokeObjectURL(previewEl.src)
    previewEl.src = URL.createObjectURL(this.file)
    this.el.dispatchEvent(new CustomEvent('valueChanged', {detail: await this.value}))
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


function SamplerUniform(uniforms, name, type, defaultAttachment) {
  Uniform.call(this, uniforms, name, type, defaultAttachment)
  this.className = uniforms.className+'/SamplerUniform'

  this.imagesEl = document.createElement('div')
  this.imagesEl.classList.add(this.className+'-Images')
  this.valueEl.appendChild(this.imagesEl)

  this.images = {...Uniform.TYPES[type].default}
  for (const target in this.images) {
    const imageEl = document.createElement('div')
    imageEl.classList.add(this.className+'-Image', target)
    this.imagesEl.appendChild(imageEl)

    const image = new ImageUpload(uniforms.className, target)
    image.el.addEventListener('valueChanged', ({detail: imageValue}) => {
      const value = this.value
      value[target] = imageValue
      this.value = value
    })
    imageEl.appendChild(image.el)

    this.images[target] = image
  }

  this.el.addEventListener('attachmentChanged', async ({detail: attachment}) => {
    this.imagesEl.style.display = attachment ? 'none' : ''

    if (attachment) {
      this.value = this.uniforms.app.values[this.type][attachment].value
    } else {
      const value = {}
      await Promise.all(Object.keys(this.images).map(async target => value[target] = await this.images[target].value))
      this.value = value
    }
  })
  this.el.dispatchEvent(new CustomEvent('attachmentChanged', {detail: this.attachment}))
}
SamplerUniform.prototype = Object.create(Uniform.prototype)


function Uniforms(el, {id, className}) {
  this.el = el
  this.id = id
  this.className = className
  this.app = el.closest('.App').__component__
  this.app.uniforms = this

  this.state = {}
}

Uniforms.prototype = {
  initialize() {
    this.app.el.addEventListener('shadersChanged', ({detail: shaders}) => {
      const oldState = this.state
      this.state = {}

      const rUniform = /uniform\s+(\S+)\s+(\S+)\s*(?:\/\*\s*attach to:([^*]+)\*\/)?\s*;/g
      const textureUnits = {}
      const currentTextureUnitByType = {}
      shaders.forEach(shader => {
        textureUnits[shader.pass] = textureUnits[shader.pass] || {}
        let match
        while (match = rUniform.exec(shader.source)) {
          const name = match[2]
          const type = match[1]
          const attachment = match[3] && match[3].trim()
          const key = name+'-'+type
          this.state[key] = oldState[key] || new Uniform.TYPES[type].constructor(this, name, type, attachment)
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