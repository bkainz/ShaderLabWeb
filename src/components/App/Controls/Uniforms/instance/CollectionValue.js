import Value from './Value'
import NumericValue from './NumericValue'
import SamplerValue from './SamplerValue'

function CollectionValue(owner, name, fields, defaultAttachment) {
  Value.call(this, owner, name, fields, defaultAttachment, [])

  this.fields = {}

  for (const field of fields) {
    const Value = NumericValue.DEFAULT_VALUES[field.type] ? NumericValue
                : SamplerValue.DEFAULT_VALUES[field.type] ? SamplerValue
                :                                           undefined
    this.fields[field.name] = new Value(this, field.name, field.type, field.defaultAttachment, field.passes)
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
  }
}))

CollectionValue.DEFAULT_VALUES = {}

export default CollectionValue