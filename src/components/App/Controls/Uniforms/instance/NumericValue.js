import Value from './Value'

function NumericValue(app, uniformName, name, type, programId) {
  Value.call(this, app, uniformName, name, type, programId)

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
  const roundValue = value => Math.round(value*1000)/1000

  this.inputEls = []
  const containerEl = document.createElement('div')
  containerEl.classList.add(this.className+'-NumericContainer')
  if (type.startsWith('mat')) containerEl.classList.add('transpose')
  this.valueEl.appendChild(containerEl)
  for (let row = 0; row < nRows; row += 1) {
    const rowEl = document.createElement('div')
    rowEl.classList.add(this.className+'-NumericRow')
    containerEl.appendChild(rowEl)

    for (let col = 0; col < nCols; col += 1) {
      const index = row*nCols+col
      this.inputEls[index] = document.createElement('input')
      this.inputEls[index].classList.add(this.className+'-NumericInput')
      this.inputEls[index].type = 'number'
      this.inputEls[index].value = roundValue(this.value[index])
      this.inputEls[index].step = inputStep
      this.inputEls[index].addEventListener('change', e => {
        this._value[index] = Number(this.inputEls[index].value)
        this.value = this._value
      })
      rowEl.appendChild(this.inputEls[index])
    }
  }

  this.el.addEventListener('valueChanged', ({detail: value}) => {
    for (let idx = 0; idx < value.length; idx += 1)
      this.inputEls[idx].value = roundValue(value[idx])
  })
}

NumericValue.prototype = Object.create(Value.prototype, Object.getOwnPropertyDescriptors({
  constructor: NumericValue,
  get value() {
    return this._value
  },
  set value(value) {
    value = Array.isArray(value) ? value : [value]
    Object.getOwnPropertyDescriptor(Value.prototype, 'value').set.call(this, value)
  }
}))

NumericValue.DEFAULT_VALUES = {
  int: [0],
  ivec2: [0, 0],
  ivec3: [0, 0, 0],
  ivec4: [0, 0, 0, 0],
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

export default NumericValue