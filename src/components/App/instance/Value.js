function Value(name, type) {
  this.name = name
  this.type = type
  this._value = undefined
  this.el = document.createElement('div')
}

Value.prototype = {
  get value() {
    return this._value
  },
  set value(value) {
    this._value = value
    this.el.dispatchEvent(new CustomEvent('valueChanged', {detail: value}))
  }
}

export default Value