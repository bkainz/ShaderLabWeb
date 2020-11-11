import Value from './Value'
import NumericValue from './NumericValue'
import SamplerValue from './SamplerValue'

function CollectionValue(app, uniformPath, name, fields, defaultAttachment) {
  Value.call(this, app, uniformPath, name, fields, defaultAttachment, [])

  this.fields = {}

  for (const field of fields) {
    const Value = field.length                            ? CollectionValue
                : NumericValue.DEFAULT_VALUES[field.type] ? NumericValue
                : SamplerValue.DEFAULT_VALUES[field.type] ? SamplerValue
                :                                           undefined
    const type = field.length ? Array.from(field, (_, idx) => ({name: idx,
                                                                type: field.type,
                                                                defaultAttachment: field.defaultAttachment,
                                                                passes: field.passes}))
                              : field.type
    this.fields[field.name] = new Value(this.app, this.uniformName, field.name, type, field.defaultAttachment, field.passes)
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