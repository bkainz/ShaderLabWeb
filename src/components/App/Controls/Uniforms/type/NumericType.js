import Type from './Type'

function NumericType(uniforms, name, type, defaultAttachment) {
  Type.call(this, uniforms, name, type, defaultAttachment)
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

NumericType.prototype = Object.create(Type.prototype, Object.getOwnPropertyDescriptors({
  constructor: NumericType,
  get value() {
    return this._value
  },
  set value(value) {
    value = Array.isArray(value) ? value : [value]
    Object.getOwnPropertyDescriptor(Type.prototype, 'value').set.call(this, value)
  }
}))

NumericType.DEFAULT_VALUES = {
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
  mat2: [1, 0,
         0, 1],
  mat3: [1, 0, 0,
         0, 1, 0,
         0, 0, 1],
  mat4: [1, 0, 0, 0,
         0, 1, 0, 0,
         0, 0, 1, 0,
         0, 0, 0, 1]
}

module.exports = NumericType