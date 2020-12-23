import Value from './Value'

function BooleanValue(app, uniformName, name, type, programId) {
  Value.call(this, app, uniformName, name, type, programId)

  const nCols = type.startsWith('bvec') ? Number(type[4]) : 1

  this.inputEls = []

  const rowEl = document.createElement('div')
  rowEl.classList.add(this.className+'-NumericRow')
  this.valueEl.appendChild(rowEl)

  for (let index = 0; index < nCols; index += 1) {
    this.inputEls[index] = document.createElement('select')
    this.inputEls[index].classList.add(this.className+'-NumericInput')

    const trueOption = document.createElement('option')
    trueOption.value = 'true'
    trueOption.innerText = 'true'
    this.inputEls[index].appendChild(trueOption)

    const falseOption = document.createElement('option')
    falseOption.value = 'false'
    falseOption.innerText = 'false'
    this.inputEls[index].appendChild(falseOption)

    this.inputEls[index].value = this.value[index]
    this.inputEls[index].addEventListener('change', e => {
      this._value[index] = this.inputEls[index].value === 'true'
      this.value = this._value
    })
    rowEl.appendChild(this.inputEls[index])
  }

  this.el.addEventListener('valueChanged', ({detail: value}) => {
    for (let idx = 0; idx < value.length; idx += 1)
      this.inputEls[idx].value = value[idx] ? 'true' : 'false'
  })
}

BooleanValue.prototype = Object.create(Value.prototype, Object.getOwnPropertyDescriptors({
  constructor: BooleanValue,
  get value() {
    return this._value
  },
  set value(value) {
    value = Array.isArray(value) ? value : [value]
    Object.getOwnPropertyDescriptor(Value.prototype, 'value').set.call(this, value)
  }
}))

BooleanValue.DEFAULT_VALUES = {
  bool: [0],
  bvec2: [0, 0],
  bvec3: [0, 0, 0],
  bvec4: [0, 0, 0, 0]
}

export default BooleanValue