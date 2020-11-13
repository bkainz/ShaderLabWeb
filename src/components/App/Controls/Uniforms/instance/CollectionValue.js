import Value from './Value'
import NumericValue from './NumericValue'
import SamplerValue from './SamplerValue'

function CollectionValue(app, uniformName, name, type, defaultAttachment, pass) {
  Value.call(this, app, uniformName, name, type.name, defaultAttachment, [])

  this.fields = {}

  for (const field of type.fields) {
    if (field instanceof Value) {
      this.fields[field.name] = field
      pass.updateUniform(field.type, field.name, field.value)
    }
    else {
      const Value = field.type.name                         ? CollectionValue
                  : NumericValue.DEFAULT_VALUES[field.type] ? NumericValue
                  : SamplerValue.DEFAULT_VALUES[field.type] ? SamplerValue
                  :                                           undefined
      const fieldUniformName = /^\d+$/.test(field.name) ? `${uniformName ? uniformName+'[' : ''}${field.name}${uniformName ? ']' : ''}`
                                                        : `${uniformName ? uniformName+'.' : ''}${field.name}`
      this.fields[field.name] = new Value(this.app, fieldUniformName, field.name, field.type, field.defaultAttachment, pass)
    }
    this.valueEl.appendChild(this.fields[field.name].el)
  }
}

CollectionValue.prototype = Object.create(Value.prototype, Object.getOwnPropertyDescriptors({
  constructor: CollectionValue,

  get value() {
    const value = {}
    for (const name in this.fields) value[name] = this.fields[name].value
    return value
  },
  set value(value) {
    for (const name in value) this.fields[name].value = value[name]
  },

  get state() {
    const state = {attachment: this.attachment, value: {}}
    if (!this.attachment) for (const name in this.fields) state.value[name] = this.fields[name].state
    return state
  },
  set state(state) {
    this.attachment = state.attachment
    if (state.value !== undefined) this.value = state.value
  },

  get uniforms() {
    const uniforms = []
    for (const name in this.fields) uniforms.push(...this.fields[name].uniforms)
    return uniforms
  }
}))

CollectionValue.DEFAULT_VALUES = {}

export default CollectionValue