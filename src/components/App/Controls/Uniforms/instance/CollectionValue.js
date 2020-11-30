import Value from './Value'
import NumericValue from './NumericValue'
import BooleanValue from './BooleanValue'
import SamplerValue from './SamplerValue'

function CollectionValue(app, uniformName, name, type, program) {
  Value.call(this, app, uniformName, name, type, [])

  this.fields = {}

  for (const field of type.fields) {
    if (field instanceof Value) {
      this.fields[field.name] = field
      field.value = field.value
    }
    else {
      const Value = field.type.fields                       ? CollectionValue
                  : NumericValue.DEFAULT_VALUES[field.type] ? NumericValue
                  : BooleanValue.DEFAULT_VALUES[field.type] ? BooleanValue
                  : SamplerValue.DEFAULT_VALUES[field.type] ? SamplerValue
                  :                                           undefined
      const fieldUniformName = /^\d+$/.test(field.name) ? `${uniformName ? uniformName+'[' : ''}${field.name}${uniformName ? ']' : ''}`
                                                        : `${uniformName ? uniformName+'.' : ''}${field.name}`
      this.fields[field.name] = new Value(this.app, fieldUniformName, field.name, field.type, program)
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
    if (this.attachment) return {attachment: this.attachment}
    const state = {value: {}}
    for (const name in this.fields) state.value[name] = this.fields[name].state
    return state
  },
  set state(state) {
    this.attachment = state.attachment || ''
    if (state.value !== undefined) for (const name in this.fields) this.fields[name].state = state.value[name]
  },

  get uniforms() {
    const uniforms = []
    for (const name in this.fields) uniforms.push(...this.fields[name].uniforms)
    return uniforms
  }
}))

CollectionValue.DEFAULT_VALUES = {}

export default CollectionValue