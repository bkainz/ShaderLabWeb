function Value(type, name) {
  this.type = type
  this._name = name
  this._value = undefined
  this.el = document.createElement('div')
}

Value.prototype = {
  get name() {
    return this._name
  },
  set name(name) {
    this._name = name
    this.el.dispatchEvent(new CustomEvent('nameChanged', {detail: name}))
  },

  get value() {
    return this._value
  },
  set value(value) {
    this._value = value
    this.el.dispatchEvent(new CustomEvent('valueChanged', {detail: value}))
  }
}

export default Value